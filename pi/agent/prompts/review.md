---
description: Review local changes for real bugs (no edits)
argument-hint: "[git-ref, default HEAD]"
---
Review the changes in `git diff ${1:-HEAD}`. When reviewing uncommitted work, also check untracked files listed by `git status --short`.

Report only real problems: bugs, logic errors, races, goroutine/fd/memory leaks, error handling that drops context, unsafe shell quoting, security issues, and behavior changes without tests. Skip style nits that formatters already handle.

For each finding give `file:line`, severity (high/medium/low), why it is wrong, and a concrete fix. Then run the narrowest existing checks covering the touched files (for example `go vet` and `go test` on changed packages, `shellcheck`, `terraform validate`, or the project's `uv run` lint/test targets) and include the results. Do not edit any files.
