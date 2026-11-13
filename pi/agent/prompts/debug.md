---
description: Debug a failure methodically, fix the root cause
argument-hint: "<symptom, failing command, or test>"
---
Debug this: $@

1. Reproduce it with the smallest possible command and show the exact output.
2. Gather evidence before changing code: read the relevant code paths, logs, and recent `git log -p` for the touched files. Use focused tools when they help, such as `go test -run X -count=1 -race`, `gdb`, or temporary logging.
3. State the root cause and the evidence for it. If there are several hypotheses, rank them and test the most likely first.
4. Make the smallest fix, add a regression test that fails without it, and rerun the reproduction plus the narrowest related tests.

Do not paper over the symptom with retries, sleeps, or broader error handling unless I ask.
