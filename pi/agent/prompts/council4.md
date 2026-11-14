---
description: Run a four-advisor council (redteam, skeptic, Carbon and Grok operators) and write a decision memo
argument-hint: "<question> [--max-passes 2|3] [--scope ...] [--non-goals ...]"
---

Run a bounded, supervisor-mediated council on this question. You, the parent
session, are the supervisor. You select which claims to relay, decide which
feedback is valid, and write the final memo. Advisors do not talk directly or
see peer transcripts. This is not free-form agent chat.

Before you orchestrate, load the council protocol with
`subagent({ action: "guide", options: { topic: "council" } })` and follow its
workflow, pass contracts, aggregate receipts, boundary checkpoints, and memo
requirements. Yield for each async workflow without polling. Keep the parent as
the only synthesizer; no chair advisor, peer chat, or transcript sharing.

Parse the invocation yourself; the flags are conventions, not runtime options.
Record a brief with the question, scope, non-goals, evidence targets, roster,
context modes, and pass cap. Default `--max-passes` to 2 and clamp it to 2 or 3.
If the question is trivial or settled, answer directly instead of convening a
council.

## Roster

Use exactly these four advisors, each with its profile's model and fresh context:

- `council-redteam`
- `council-skeptic`
- `council-operator` (Gemini 4 Carbon)
- `council-operator-grok` (Grok 4.7)

This roster deliberately uses the four-advisor maximum. Do not add others. If any
of them is missing from `subagent({ action: "list" })`, say which, run with the
remaining ones if at least two are left, and note it in the memo.

The two operator seats share a stance on different vendors. Relay each one's
unique claims to the other in Pass 2, and in the memo's evidence section record,
for each operator seat, its wall-clock time, cost, structured-output validity in
both passes, and which of its unique findings survived cross-examination.

Question and options from the slash command invocation:

$@
