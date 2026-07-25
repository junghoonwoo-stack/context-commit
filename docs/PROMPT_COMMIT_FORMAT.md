# Prompt Commit format

ContextCommit stores durable memory as human-readable Markdown with YAML
frontmatter. Version 2 separates the lightweight retrieval index from details
and artifact diffs.

## Progressive disclosure

Future Agents should load context in three levels:

1. **Index** — `.context-commit/CURRENT_CONTEXT.md` contains only the best
   matching summaries, key decisions and constraints, freshness, and a source
   pointer.
2. **Details** — `context-commit show "<source>"` opens the full Prompt Commit
   without its Artifact Diff.
3. **Evidence** — `context-commit show "<source>" --section diff` opens exact
   file changes only when they matter.

Do not preload complete Prompt Commits or diffs. The original Markdown remains
the source of truth and is never destructively compressed.

## Version 2

```markdown
---
format: context-commit/v2
id: "2026-07-25T104218-abc12"
started_at: "2026-07-25T01:40:00.000Z"
ended_at: "2026-07-25T01:42:18.000Z"
fresh_until: "2026-10-23T01:42:18.000Z"
workspace: "customer-care"
scope: "team"
team: "customer-care"
member: "alex"
goal: "Improve the customer onboarding proposal"
summary: "Reframed onboarding around setup anxiety"
reuse_when: "Creating subscription onboarding materials"
topics:
  - "customer-onboarding"
  - "subscription-care"
entities:
  - "Care+ Pilot"
context_types:
  - "context"
  - "decision"
sensitivity: "internal"
confidence: "confirmed"
status: "active"
artifacts:
  - "proposal.md"
---
```

The Markdown body contains Outcome Diff, Context That Mattered, Decisions,
Constraints, Prompt Trajectory, Validation, Reuse When, and Artifact Diff.

## Metadata rules

Metadata exists to improve retrieval, freshness checks, ownership, and safe
sharing. Unknown values should be left empty rather than guessed.

- `format`: schema identifier. New commits use `context-commit/v2`; v1 remains
  readable.
- `id`: immutable session ID used for deduplication.
- `started_at`, `ended_at`: ISO 8601 timestamps.
- `fresh_until`: review horizon, not an automatic deletion date. Stale context
  can still be evidence but must be verified.
- `workspace`: working-directory name where the outcome was produced.
- `scope`: `personal` or `team`. This describes intended retrieval scope, not
  filesystem authorization.
- `team`: shared-memory namespace. Actual access is enforced by the shared
  drive, SharePoint, or Git permissions.
- `member`: person or Agent identity responsible for the commit.
- `goal`: the task at session start.
- `summary`: one plain-language sentence describing the outcome.
- `reuse_when`: a concrete future situation in which retrieval is useful.
- `topics`: one to five stable, specific nouns. Prefer `customer-onboarding`
  over generic tags such as `work`, `document`, or `AI`.
- `entities`: exact names of products, projects, customers, systems, policies,
  or regulations. Do not use broad categories.
- `context_types`: derived from captured sections, such as `decision`,
  `constraint`, `context`, `instruction`, and `validation`.
- `sensitivity`: `private`, `public`, `internal`, `confidential`, or
  `restricted`. Shared memory defaults to `internal`; personal memory defaults
  to `private`.
- `confidence`: `confirmed`, `working`, or `uncertain`. Use `confirmed` only
  when validation evidence exists.
- `status`: `active`, `superseded`, or `archived`. Superseded and archived
  commits remain on disk but are excluded from default retrieval.
- `artifacts`: paths changed during the session.

Never include credentials, secrets, unnecessary personal data, or raw
conversation text in metadata.

## What is not a Prompt Commit

- a full raw transcript
- a generic summary with no outcome
- a list of every tool call
- credentials or confidential personal data
- context with no provenance or reuse condition
