# Organization memory

ContextCommit separates the memory format from the storage system. Prompt
Commits remain plain Markdown; the configured shared directory decides how an
organization stores, governs, and distributes them.

## Recommended architecture

```text
Agent workspace
  ├── local context-memory/       private durable copy
  └── shared memory adapter
        └── organization store    governed shared copy
```

The local copy is written first. Shared publication is a second, retryable
step. New sessions retrieve relevant context from both locations and
deduplicate Prompt Commits by ID.

Shared Prompt Commits are append-only. ContextCommit does not rewrite a central
shared index on every session, avoiding a multi-writer conflict on SharePoint,
network drives, and Git working trees.

## Which shared store to choose

| Store | Best for | Strengths | Tradeoffs |
|---|---|---|---|
| SharePoint document library | General enterprise rollout | Existing identity, access groups, retention, DLP, eDiscovery | Requires a synced or mounted folder in the current MVP |
| Private Git repository | Engineering and Agent-development teams | Diff, review, branches, provenance, automation | Less accessible to non-developers; sensitive content needs careful controls |
| Network drive | Small controlled pilot | Fastest setup, familiar permissions | Weak metadata, search, conflict handling, and version governance |

For a Microsoft 365 enterprise, use a **dedicated SharePoint document library**
as the default organizational memory—not an individual's OneDrive folder and
not a general-purpose team folder. Give each business domain an access group
and retention policy.

For a software or Agent platform team, a **dedicated private Git repository**
is often the better first store. Do not mix Prompt Commits into the product
source repository; keep context access and code access independently
governable.

## Directory layout

ContextCommit creates the shared structure automatically:

```text
company-context/
├── INDEX.md
└── commits/
    └── customer-care/
        └── clinic-onboarding/
            └── 2026-07-25/
                └── alex-<session-id>-<summary>.md
```

The hierarchy is:

```text
team / workspace / date / member-session-summary
```

Agents retrieve shared commits only from their configured `team`. Use separate
shared roots or storage permissions for hard access boundaries; the `team`
field is a retrieval namespace, not a security control.

The Prompt Commit frontmatter also records `team`, `member`, `workspace`, and
session timestamps so the same files remain understandable across tools.

## Setup

For a first test, point every participant at the same locally available folder.
The path alone is enough:

```bash
context-commit init --shared "/mounted/company-context"
```

On Windows:

```powershell
context-commit init --shared "Z:\Company Context"
```

ContextCommit creates the shared structure and uses the default team namespace.
For separate team namespaces and explicit member names:

```bash
context-commit init \
  --shared "/mounted/company-context" \
  --team "customer-care" \
  --member "alex"
```

Normal session completion publishes automatically. To retry or backfill local
Prompt Commits:

```bash
context-commit sync
```

## Governance before broad rollout

1. Define which context classifications may be shared.
2. Create domain-level access groups; avoid one company-wide read group.
3. Require the Agent to exclude credentials, personal data, and raw
   conversations.
4. Assign owners for stale, conflicting, or incorrect Prompt Commits.
5. Set freshness and retention rules.
6. Pilot with one team and review commits before scaling.

Filesystem sharing is the current transport. Storage permissions remain the
security boundary; ContextCommit keeps the Markdown contract independent of
the selected shared folder.
