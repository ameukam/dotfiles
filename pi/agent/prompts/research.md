---
description: Research a topic or harness improvement using primary engineering sources
argument-hint: "<topic, question, or URL>"
---
Research this: $@

Prioritize primary engineering sources over papers or SEO summaries:

1. **Code & issues first:** Check GitHub repos, issues, PRs, and changelogs using `fetch_content` (which clones repos and runs `gh`) or `gh` directly. For pi harness topics, also inspect `/opt/pi-coding-agent/{docs,examples,CHANGELOG.md}`, `~/.pi/agent/npm/node_modules/pi-subagents/docs/`, and relevant `~/.pi/agent/sessions/*/subagent-artifacts/*_meta.json` telemetry.
2. **Web & engineering blogs:** Run `web_search` (configured for `gemini` + `exa`) for official docs, engineering blogs, Hacker News, and practitioner failure reports. Fetch primary URLs with `fetch_content` rather than trusting snippets.
3. **SDK / library APIs:** When checking library or framework APIs, use `codemode` with the `context7` MCP namespace (`resolve-library-id`, `query-docs`) for version-accurate docs.
4. **Academic algorithms/benchmarks:** Use `codemode` with the `arxiv` MCP namespace (`search_papers`, `get_abstract`, `get_paper_latex_section`) when formal methods or benchmarks are relevant.
5. **Verify:** Run `source_check` against fetched sources for any decision-critical, benchmark, pricing, or security claim.

Cite exact files, URLs, or commit/PR references for every finding, flag contradictions or unverified claims explicitly, and do not edit files unless asked.
