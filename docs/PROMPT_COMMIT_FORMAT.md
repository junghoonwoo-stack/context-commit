# Prompt Commit format

ContextCommit stores durable context as human-readable Markdown. Version 3 adds
automatic promotion metadata while keeping the body focused on the Outcome Diff
and the causal Prompt Trajectory.

## Version 3

```markdown
---
format: context-commit/v3
id: "2026-07-25T104218-abc12"
workspace: "billing-service"
visibility: "team"
lifecycle: "published"
team: "payments"
member: "alex"
owner_role: "payments"
goal: "Fix duplicate payment webhook processing"
summary: "Made payment webhooks idempotent by event ID"
reuse_when: "Implementing or reviewing payment webhook handlers"
promotion_policy: "outcome-diff-v1"
promotion_reason: "auto-published: reusable Outcome Diff with causal context and validation"
topics:
  - "payments"
  - "webhooks"
sensitivity: "internal"
confidence: "confirmed"
artifacts:
  - "src/webhooks/payment-handler.ts"
---
```

The body contains:

- Outcome Diff
- Context That Mattered
- Decisions and Constraints
- Prompt Trajectory
- Validation
- Reuse When
- Artifact Diff

## Promotion fields

- `visibility`: `personal`, `team`, or `organization`
- `lifecycle`: `candidate`, `published`, `superseded`, `rejected`, or `expired`
- `owner_role`: the durable team or role responsible for the context
- `promotion_policy`: the deterministic policy version used
- `promotion_reason`: why the item stayed local, became a candidate, or was
  published

Version 2 `scope` and `status` remain readable. New commits use Version 3.

## Progressive disclosure

Agents load context in three levels:

1. `.context-commit/CURRENT_CONTEXT.md` — small relevant cards
2. `context-commit show "<source>"` — full details without artifact diffs
3. `context-commit show "<source>" --section diff` — exact file evidence

Shared Inbox candidates are not retrieved. Published team and organization
knowledge is retrieved before deeper evidence is opened.

## What is not a Prompt Commit

- a raw transcript
- a generic session summary with no Outcome Diff
- a list of every tool call
- credentials or unnecessary personal data
- context with no causal explanation or reuse condition
