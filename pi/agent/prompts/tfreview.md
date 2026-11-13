---
description: Review Terraform changes without touching state
argument-hint: "[directory or saved plan file]"
---
Review the Terraform changes in ${1:-the current directory}.

Never run `terraform apply`, `destroy`, `import`, `state`, `workspace`, `taint`, `untaint`, `force-unlock`, or `init` with `-upgrade`, `-migrate-state`, or `-reconfigure`. If `.terraform/` is missing, ask me before running `terraform init -backend=false`. Do not print variable values, outputs, state contents, or secrets.

1. Run `terraform fmt -check -diff -recursive` and `terraform validate`.
2. If I gave a saved plan file, read it with `terraform show -no-color <plan>` and summarize destroys and replacements first, then IAM, networking, DNS, and data-store changes, then everything else.
3. Review the code diff for: stateful resources without `prevent_destroy`, renames or `count`/`for_each` changes without `moved` blocks, unpinned provider or module versions, hard-coded secrets, and overly broad IAM.

Report findings with `file:line` and severity. Do not edit files.
