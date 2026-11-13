---
description: Commit staged changes with a short plain message
argument-hint: "[extra context]"
---
Commit the currently staged changes. Do not stage, unstage, or modify files. If nothing is staged, stop and tell me.

Read `git diff --cached` and `git log --oneline -10` to match the repository's subject style. Write a message of 1-3 short plain sentences saying what changed and why: a summary line under 72 characters, optionally followed by a blank line and one or two more sentences. No headings, bullet lists, or verification notes.

Extra context from me (may be empty): $@

Run `git commit`, never push, then show `git log -1 --stat`.
