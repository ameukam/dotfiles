/**
 * Permission Gate (adapted from Pi's examples/extensions/permission-gate.ts)
 *
 * Asks before risky bash commands: terraform/tofu state changes, kubectl and
 * helm cluster changes, gcloud/gsutil resource changes, git history rewrites,
 * system-level commands, and bash writes into credential/config directories.
 * Also asks before edit/write on protected paths (.env*, .git/, node_modules/,
 * ~/.ssh, ~/.kube, ~/.gnupg, gh/gcloud config, Pi's own config) and before
 * overwriting an existing file outside a git repository.
 * Commands issued through codemode pass through the same tool_call hook.
 * Without a UI (pi -p, RPC, subagent children) matched commands are blocked.
 *
 * This is a guardrail against accidents, not a sandbox: obfuscated commands
 * (e.g. `$tf apply`, base64 | sh) are not detected.
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, resolve } from "node:path";
import { type ExtensionAPI, type ExtensionContext, isToolCallEventType } from "@earendil-works/pi-coding-agent";

type Rule = { label: string; test: (segment: string) => boolean };

// Program name as a standalone word: segment start, or after whitespace, quote, paren, backtick, brace or path slash.
const START = String.raw`(?:^|[\s(\x60'"{/])`;
const END = String.raw`(?=[\s'"\x60)]|$)`;
const DRY_RUN = /--dry-run(?!=none)/;

/** Text after `<bin> [global flags] <sub>` within one segment, or null when absent. */
function after(segment: string, bin: string, sub: string): string | null {
	const m = new RegExp(String.raw`${START}(?:${bin})\s(?:.*?\s)?(?:${sub})${END}(.*)$`).exec(segment);
	return m ? m[1] : null;
}

const rules: Rule[] = [
	{
		label: "terraform state change",
		test: (s) =>
			after(
				s,
				"terraform|tofu|terragrunt",
				String.raw`apply|destroy|import|force-unlock|taint|untaint|state\s+(?:rm|mv|push|replace-provider)|workspace\s+delete`,
			) !== null,
	},
	{
		label: "kubectl destructive",
		test: (s) => {
			if (DRY_RUN.test(s)) return false;
			if (after(s, "kubectl", "delete|drain") !== null) return true;
			const rest = after(s, "kubectl", "replace");
			return rest !== null && /(?:^|\s)--force\b/.test(rest);
		},
	},
	{
		label: "kubectl cluster change",
		test: (s) =>
			!DRY_RUN.test(s) &&
			(after(s, "kubectl", String.raw`apply|create|patch|replace|scale|autoscale|set|edit|label|annotate|taint|cordon|uncordon`) !== null ||
				after(s, "kubectl", String.raw`rollout\s+(?:restart|undo|pause|resume)`) !== null),
	},
	{
		label: "gcloud resource change",
		test: (s) => {
			const m = new RegExp(String.raw`${START}gcloud\s+(.*)$`).exec(s);
			if (m) {
				// Command words come before the first flag; local CLI state (config/auth/components) is not a resource change.
				const words = m[1].split(/\s+/).filter(Boolean);
				const firstFlag = words.findIndex((w) => w.startsWith("-"));
				const cmd = firstFlag === -1 ? words : words.slice(0, firstFlag);
				if (["config", "auth", "components", "info", "help"].includes(cmd[0] ?? "")) return false;
				const verbs = /^(?:create|delete|update|patch|set|unset|add-[\w-]+|remove-[\w-]+|set-[\w-]+|deploy|resize|reset|start|stop|suspend|resume|import|enable|disable|rm|mv|cp|apply|undelete|restore|rollback|upgrade)$/;
				return cmd.slice(1).some((w) => verbs.test(w));
			}
			return after(s, "gsutil", "rm|rb|mv|rsync") !== null;
		},
	},
	{
		label: "helm release change",
		test: (s) =>
			!DRY_RUN.test(s) &&
			!/\shelm\s+(?:.*?\s)?(?:plugin|diff)\s/.test(` ${s}`) &&
			after(s, "helm", "install|upgrade|uninstall|delete|rollback") !== null,
	},
	{
		label: "git force push",
		test: (s) => {
			const rest = after(s, "git", "push");
			return (
				rest !== null &&
				/(?:^|\s)(?:--force(?:-with-lease|-if-includes)?(?:=\S*)?|-[A-Za-z]*f[A-Za-z]*|\+\S+)(?=\s|$)/.test(rest)
			);
		},
	},
	{
		label: "git reset --hard",
		test: (s) => {
			const rest = after(s, "git", "reset");
			return rest !== null && /(?:^|\s)--hard(?=\s|$)/.test(rest);
		},
	},
	{
		label: "git clean -f",
		test: (s) => {
			const rest = after(s, "git", "clean");
			return (
				rest !== null &&
				/(?:^|\s)(?:-[A-Za-z]*f[A-Za-z]*|--force)(?=\s|$)/.test(rest) &&
				!/(?:^|\s)(?:-[A-Za-z]*n[A-Za-z]*|--dry-run)(?=\s|$)/.test(rest)
			);
		},
	},
	{
		label: "git branch -D",
		test: (s) => {
			const rest = after(s, "git", "branch");
			return (
				rest !== null &&
				(/(?:^|\s)-[A-Za-z]*D[A-Za-z]*(?=\s|$)/.test(rest) || (/\s--delete\b/.test(` ${rest}`) && /\s--force\b/.test(` ${rest}`)))
			);
		},
	},
	{
		label: "git commit --amend",
		test: (s) => {
			const rest = after(s, "git", "commit");
			return rest !== null && /(?:^|\s)--amend(?=\s|$)/.test(rest);
		},
	},
	{
		label: "git rebase",
		test: (s) => {
			const rest = after(s, "git", "rebase");
			return rest !== null && !/(?:^|\s)--(?:abort|continue|skip|quit|show-current-patch)(?=\s|$)/.test(rest);
		},
	},
	{
		label: "service state change",
		test: (s) =>
			after(s, "systemctl", "stop|disable|restart|mask|kill|isolate|poweroff|reboot|halt") !== null ||
			new RegExp(String.raw`${START}service\s+\S+\s+(?:stop|restart)${END}`).test(s),
	},
	{
		label: "package removal",
		test: (s) =>
			after(s, "apt|apt-get|dnf|yum|zypper|brew|snap|flatpak", "remove|purge|autoremove|uninstall|erase|rm") !== null ||
			new RegExp(String.raw`${START}pacman\s(?:.*\s)?-R[A-Za-z]*${END}`).test(s),
	},
	{ label: "truncate/shred", test: (s) => /^(?:(?:sudo|doas|xargs|exec|command)\s+(?:-\S+\s+)*)?(?:\S*\/)?(?:truncate|shred)(?=\s|$)/.test(s) },
	{
		label: "recursive rm",
		test: (s) => new RegExp(String.raw`${START}(?<!\bgit\s)rm\s(?:.*\s)?(?:-[A-Za-z]*[rR][A-Za-z]*|--recursive)(?=\s|$)`).test(s),
	},
	{ label: "privilege escalation", test: (s) => new RegExp(String.raw`${START}(?:sudo|doas|run0|pkexec)${END}`).test(s) },
	{ label: "chmod/chown 777", test: (s) => new RegExp(String.raw`${START}(?:chmod|chown)\s(?:.*\s)?0?777${END}`).test(s) },
	{ label: "dd write", test: (s) => new RegExp(String.raw`${START}dd\s(?:.*\s)?of=`).test(s) },
	{ label: "mkfs", test: (s) => new RegExp(String.raw`${START}mkfs(?:\.\w+)?${END}`).test(s) },
	{
		label: "bash write to credential/config dir",
		// Only writes: a redirect, tee, or a mutating command whose arguments name a sensitive path. Reads pass.
		test: (s) => {
			if (!SENSITIVE_IN_TEXT.test(s)) return false;
			if (new RegExp(String.raw`>{1,2}\s*["']?${SENSITIVE_SRC}`).test(s)) return true;
			return new RegExp(String.raw`${START}(?:tee|cp|mv|rm|ln|install|chmod|chown|truncate|rsync|sed\s+(?:\S+\s+)*-i\S*)${END}`).test(s);
		},
	},
];

function matchRules(command: string): string[] {
	const segments = command.replace(/\\\r?\n/g, " ").split(/&&|\|\||[;&|\n]/);
	const hits = new Set<string>();
	for (const segment of segments) {
		for (const rule of rules) if (rule.test(segment.trim())) hits.add(rule.label);
	}
	return [...hits];
}

// .env, .env.local, .env.production … but not .env.example/.sample/.template
const PROTECTED_PATH = /(?:^|\/)(?:\.env(?:\.(?!example$|sample$|template$|dist$)[^/]+)?$|\.git\/|node_modules\/)/;

// Credential and config locations: SSH, kube, GnuPG, gh/gcloud CLI config, and Pi's own
// config (not sessions/caches) both under ~/.pi/agent and in the dotfiles repo.
const SENSITIVE_SRC = String.raw`(?:~|\$HOME|\$\{HOME\}|/home/[^/\s]+)/(?:\.ssh|\.kube|\.gnupg|\.config/gh|\.config/gcloud|\.pi/agent/(?:auth\.json|settings\.json|models\.json|mcp\.json|extensions|agents|prompts)|dotfiles/pi)(?:/|\b)`;
const SENSITIVE_IN_TEXT = new RegExp(SENSITIVE_SRC);
const SENSITIVE_ABS = new RegExp(
	String.raw`^${homedir().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(?:\.ssh|\.kube|\.gnupg|\.config/gh|\.config/gcloud|\.pi/agent/(?:auth\.json|settings\.json|models\.json|mcp\.json|extensions|agents|prompts)|dotfiles/pi)(?:/|$)`,
);

function resolvePath(raw: string, cwd: string): string {
	let p = raw.startsWith("@") ? raw.slice(1) : raw;
	if (p === "~" || p.startsWith("~/")) p = homedir() + p.slice(1);
	return isAbsolute(p) ? p : resolve(cwd, p);
}

function inGitRepo(path: string): boolean {
	for (let dir = dirname(path); ; dir = dirname(dir)) {
		if (existsSync(resolve(dir, ".git"))) return true;
		if (dirname(dir) === dir) return false;
	}
}

function matchFileTool(tool: "edit" | "write", rawPath: string, cwd: string): string[] {
	const abs = resolvePath(rawPath, cwd);
	if (PROTECTED_PATH.test(abs)) return [`${tool} protected path`];
	if (SENSITIVE_ABS.test(abs)) return [`${tool} credential/config path`];
	if (tool === "write" && existsSync(abs) && !inGitRepo(abs)) return ["overwrite file outside git"];
	return [];
}

async function gate(hits: string[], subject: string, ctx: ExtensionContext) {
	const what = hits.join(", ");
	if (!ctx.hasUI) {
		return {
			block: true,
			reason: `permission-gate blocked (${what}): needs interactive approval and no UI is available. Do not retry or rephrase it; ask the user to run it or approve it in an interactive session.`,
		};
	}

	const preview = subject.length > 800 ? `${subject.slice(0, 800)} …` : subject;
	const choice = await ctx.ui.select(`⚠️  permission-gate: ${what}\n\n  ${preview}\n\n  cwd: ${ctx.cwd}\n`, ["Block", "Allow once"]);
	if (choice !== "Allow once") {
		return { block: true, reason: `Blocked by user via permission-gate (${what}). Do not retry or work around it; ask the user how to proceed.` };
	}
	return undefined;
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (isToolCallEventType("bash", event)) {
			const hits = matchRules(event.input.command);
			return hits.length ? gate(hits, event.input.command, ctx) : undefined;
		}
		if (isToolCallEventType("edit", event) || isToolCallEventType("write", event)) {
			const path = event.input.path;
			if (typeof path !== "string") return undefined;
			const hits = matchFileTool(event.toolName as "edit" | "write", path, ctx.cwd);
			return hits.length ? gate(hits, `${event.toolName} ${path}`, ctx) : undefined;
		}
		return undefined;
	});
}
