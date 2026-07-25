# Prompt Commit format

ContextCommit stores durable memory as Markdown with YAML frontmatter.

## Design principles

1. Store the meaningful change, not the entire conversation.
2. Keep human-readable Markdown as the source of truth.
3. Preserve enough provenance to understand why an outcome changed.
4. Include freshness and reuse guidance.
5. Keep secrets, credentials, and unnecessary personal data out.

## Version 1

```markdown
---
format: context-commit/v1
id: "2026-07-25T104218-abc12"
started_at: "2026-07-25T01:40:00.000Z"
ended_at: "2026-07-25T01:42:18.000Z"
fresh_until: "2026-10-23T01:42:18.000Z"
workspace: "customer-care"
team: "customer-care"
member: "alex"
goal: "Improve the customer onboarding proposal"
summary: "Reframed onboarding around setup anxiety"
artifacts:
  - "proposal.md"
---

# Reframed onboarding around setup anxiety

## Goal

Improve the customer onboarding proposal.

## Outcome Diff

The proposal now begins with the customer's setup anxiety.

## Context That Mattered

- Recent interviews showed setup was the largest source of hesitation.

## Decisions

- Organize the proposal by customer situation rather than product feature.

## Constraints

- Keep the first page understandable without technical terminology.

## Prompt Trajectory

- The user asked to make the field experience feel visible.
- The user removed smart-feature content as a distraction.

## Validation

- Compared the final proposal with the interview findings.

## Reuse When

Creating customer-care messaging or subscription onboarding materials.

## Artifact Diff

The tracked text diff appears here.
```

## What is not a Prompt Commit

- a full raw transcript
- a generic summary with no outcome
- a list of every tool call
- credentials or confidential personal data
- context with no provenance or reuse condition
