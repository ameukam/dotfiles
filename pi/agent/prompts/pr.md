---
description: Prepare a GitHub PR, then wait for approval before pushing
argument-hint: "[base-branch]"
---
Prepare a pull request for the committed work on the current branch against ${1:-the repository's default branch}. If there are uncommitted changes, stop and tell me.

1. If I am on the base branch, pick a short descriptive branch name without a `copilot/`, `pi/`, or other tool prefix.
2. Draft a PR title and a description of 1-3 short plain sentences: what changed and why. No headings, checklists, or verification narrative.
3. Show me the branch name, title, description, and the exact `git push` and `gh pr create` commands, then stop. Only create the branch, push, and open the PR after I confirm.
