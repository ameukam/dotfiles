/**
 * Worktree Guard
 *
 * Enforces that git worktrees are only created under `<repo>/.worktrees/`,
 * where `<repo>` is the main checkout of the repository the session works in
 * (for a session started at a repo root this is `$PWD/.worktrees`).
 *
 * - Blocks bash `git worktree add <path>` / `git worktree move <wt> <path>`
 *   whose target resolves outside `<repo>/.worktrees/`.
 * - Adds a short system-prompt note so the model picks the right location.
 *
 * pi-subagents `worktree: true` runs are routed through Worktrunk
 * (~/.config/worktrunk/config.toml: worktree-path = "{{ repo_path }}/.worktrees/...").
 * Guardrail, not a sandbox: obfuscated commands are not detected.
 */

import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { type ExtensionAPI, isToolCallEventType } from "@earendil-works/pi-coding-agent";

const DIR = ".worktrees";

/** Main checkout root for `cwd` (resolves linked worktrees back to the main repo), or null outside git. */
function mainRepoRoot(cwd: string): string | null {
	try {
		const common = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
			cwd,
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
			timeout: 5000,
		}).trim();
		if (!common) return null;
		// Normal repo: <root>/.git ; bare repo: the common dir itself.
		return common.endsWith("/.git") ? dirname(common) : common;
	} catch {
		return null;
	}
}

function isInside(parent: string, child: string): boolean {
	const rel = relative(parent, child);
	return !!rel && rel !== ".." && !rel.startsWith("../") && !isAbsolute(rel);
}

function expand(p: string, base: string): string {
	const unq = p.replace(/^(['"])(.*)\1$/, "$2");
	if (unq === "~" || unq.startsWith("~/")) return resolve(homedir(), unq.slice(2));
	return resolve(base, unq);
}

/** Naive shell tokenizer: whitespace split respecting simple quotes. */
function tokens(segment: string): string[] {
	return segment.match(/'[^']*'|"[^"]*"|[^\s]+/g) ?? [];
}

// `git worktree add` options that consume the next token.
const ADD_VALUE_OPTS = new Set(["-b", "-B", "--reason"]);

type Hit = { target: string; resolved: string; allowedRoot: string };

function checkCommand(command: string, sessionCwd: string): Hit[] {
	const hits: Hit[] = [];
	let cwd = sessionCwd;
	// Split on control operators; track simple `cd <dir>` for relative paths.
	for (const raw of command.split(/&&|\|\||;|\||\n/)) {
		const t = tokens(raw.trim());
		if (t.length === 0) continue;
		if (t[0] === "cd" && t[1]) {
			cwd = expand(t[1], cwd);
			continue;
		}
		const gi = t.findIndex((w) => w === "git" || w.endsWith("/git"));
		if (gi < 0) continue;
		// git global options before the subcommand.
		let base = cwd;
		let i = gi + 1;
		while (i < t.length && t[i].startsWith("-")) {
			if (t[i] === "-C" && t[i + 1]) {
				base = expand(t[i + 1], base);
				i += 2;
			} else if (t[i] === "-c" || t[i] === "--git-dir" || t[i] === "--work-tree") {
				i += 2;
			} else i++;
		}
		if (t[i] !== "worktree") continue;
		const sub = t[i + 1];
		if (sub !== "add" && sub !== "move") continue;
		const positionals: string[] = [];
		for (let j = i + 2; j < t.length; j++) {
			const w = t[j];
			if (w === "--") {
				positionals.push(...t.slice(j + 1));
				break;
			}
			if (w.startsWith("-")) {
				if (sub === "add" && ADD_VALUE_OPTS.has(w)) j++;
				continue;
			}
			positionals.push(w);
		}
		const target = sub === "add" ? positionals[0] : positionals[1];
		if (!target) continue;
		const root = mainRepoRoot(base);
		if (!root) continue;
		const allowedRoot = resolve(root, DIR);
		const resolved = expand(target, base);
		if (!isInside(allowedRoot, resolved)) hits.push({ target, resolved, allowedRoot });
	}
	return hits;
}

export default function (pi: ExtensionAPI) {
	pi.on("before_agent_start", async (event, ctx) => {
		const root = mainRepoRoot(ctx.cwd);
		if (!root) return;
		const rule =
			`Git worktrees go ONLY under ${resolve(root, DIR)}/<name> ` +
			`(e.g. \`git worktree add ${resolve(root, DIR)}/my-branch -b my-branch\`); never anywhere else.`;
		const g = event.systemPromptOptions.promptGuidelines;
		if (Array.isArray(g) && !g.includes(rule)) g.push(rule);
	});

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;
		const hits = checkCommand(String(event.input.command ?? ""), ctx.cwd);
		if (hits.length === 0) return;
		const h = hits[0];
		return {
			block: true,
			reason:
				`worktree-guard blocked: worktree target ${h.resolved} is outside ${h.allowedRoot}/. ` +
				`Git worktrees must be created under ${h.allowedRoot}/<name>; retry with that location.`,
		};
	});
}
