# Prompt Commit format

ContextCommit stores durable context as human-readable Markdown. Version 4 makes
the reusable unit explicit: **Skill Diff + Outcome Evidence + Reuse When**.

## Why this is a knowledge unit

A Prompt Commit is not a session summary. It records one conditional change to
the way work should be done.

```text
Base Skill
+ Condition
+ Logic change
= Adapted workflow
```

| Base Skill | Condition | Skill Diff | Outcome Evidence |
| --- | --- | --- | --- |
| Customer interview summary | Audience is an executive | Put business impact and the decision needed first; compress feature detail | PM approved the final executive brief |
| Incident update | Customer communication is required | Remove internal speculation and include the next update time | Support lead approved the customer update |

The Prompt Trajectory preserves where the change came from: a correction, fact,
constraint, or decision. When published, the rule no longer depends on the
original person being available to explain it.

## Version 4

```markdown
---
format: context-commit/v4
id: "2026-07-26T104218-abc12"
workspace: "customer-research"
visibility: "team"
lifecycle: "published"
team: "research"
member: "alex"
owner_role: "research"
goal: "Summarize a customer interview for executive review"
summary: "Adapted the interview summary for executives"
base_skill: "customer-interview-summary"
reuse_when: "Summarizing customer interviews for executives"
promotion_policy: "skill-diff-v1"
promotion_reason: "auto-published: reusable Skill Diff with outcome evidence and validation"
topics:
  - "customer research"
  - "executive brief"
sensitivity: "internal"
confidence: "confirmed"
artifacts:
  - "executive-brief.md"
---

# Adapted the interview summary for executives

## Base Skill

- customer-interview-summary

## Skill Diff

- Condition: audience = executive
- Logic change: lead with revenue, cost, churn, and the decision needed
- Logic change: compress detailed feature requests

## Outcome Evidence

- The PM approved the final executive brief.
- **modified:** `executive-brief.md`

## Prompt Trajectory

- The user identified the executive audience and corrected the general summary.

## Validation

- Confirmed the brief contains business impact, evidence, and a clear decision.

## Reuse When

- Summarizing customer interviews for executives.
```

The full body may also contain:

- Context That Mattered
- Decisions and Constraints
- Artifact Diff

## Promotion fields

- `visibility`: `personal`, `team`, or `organization`
- `lifecycle`: `candidate`, `published`, `superseded`, `rejected`, or
  `expired`
- `owner_role`: the durable team or role responsible for the context
- `base_skill`: the Skill, playbook, or workflow that was adapted
- `promotion_policy`: the deterministic policy version used
- `promotion_reason`: why the item stayed local, became a candidate, or was
  published

Versions 2 and 3 remain readable. Version 3 `Outcome Diff` is treated as
backward-compatible outcome evidence. New commits use Version 4.

## Progressive disclosure

Agents load context in three levels:

1. `.context-commit/CURRENT_CONTEXT.md` — small relevant Skill Diff cards
2. `context-commit show "<source>"` — full details without artifact diffs
3. `context-commit show "<source>" --section diff` — exact file evidence

Shared Inbox candidates are not retrieved. Published team and organization
knowledge is retrieved before deeper evidence is opened.

## What is not a Prompt Commit

- a raw transcript
- a generic session summary with no Skill Diff or outcome evidence
- an unstructured list of every exception ever encountered
- a list of every tool call
- credentials or unnecessary personal data
- context with no causal explanation or reuse condition
