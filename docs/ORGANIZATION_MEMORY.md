# Organization memory

ContextCommit's core job is not session storage. It promotes reusable context
from individual Agent work into durable organization memory.

## Minimal promotion pipeline

```text
Agent session
  → Outcome Diff evaluation
  → personal / team / organization
  → candidate / published
```

The built-in `outcome-diff-v1` policy uses signals already visible in the work:

- a changed artifact or an explicit decision/constraint
- causal context such as a fact, correction, or rejected approach
- a concrete `Reuse When`
- validation evidence
- sensitivity classification

No separate model, API, database, or per-session sharing prompt is required.

## Automatic routing

| Result | Location | Loaded by other Agents? |
| --- | --- | --- |
| No reusable Outcome Diff | Discarded | No |
| Personal or sensitive context | Local `context-memory/` | No |
| Reusable but not validated | Shared `inbox/` | No |
| Reusable, validated, low-risk context | Shared `knowledge/` | Yes |

`internal` and `public` items may be promoted. `private`, `confidential`, and
`restricted` items stay local. This metadata is a routing guard, not a security
boundary; storage permissions still control access.

## Workspace policy

A shared path defaults to team promotion:

```bash
context-commit init --shared "/mounted/company-context" --team "payments"
```

An administrator can configure a workspace for organization-wide promotion:

```bash
context-commit init --shared "/mounted/company-context" \
  --team "platform" --promotion-target organization
```

This keeps the decision out of each person's end-of-session workflow. Team and
organization scope are workspace policy.

## Directory layout

```text
company-context/
├── inbox/
│   ├── team/<team>/<workspace>/<date>/<commit>.md
│   └── organization/<workspace>/<date>/<commit>.md
└── knowledge/
    ├── team/<team>/<workspace>/<date>/<commit>.md
    └── organization/<workspace>/<date>/<commit>.md
```

Only `knowledge/team/<current-team>/` and `knowledge/organization/` are
retrieved. Inbox candidates remain inspectable evidence but do not silently
shape another person's Agent.

## Storage

Prompt Commits are plain Markdown, so the same contract works with:

- a dedicated SharePoint document library
- a private Git repository for engineering teams
- a controlled network drive for a pilot

ContextCommit writes the local copy first. Shared publication is retryable with
`context-commit sync`. Use separate roots or storage permissions for hard
access boundaries; metadata is not access control.

## Governance before broad rollout

1. Set the promotion target and allowed sensitivity classes centrally.
2. Assign ownership to a team or role, not only a person.
3. Review Inbox candidates and false promotions during the pilot.
4. Define how published knowledge is superseded or expired.
5. Keep raw Agent sessions local; share only extracted Prompt Commits.

The v0.5 pipeline deliberately stops at trustworthy published Prompt Commits.
Compiling many commits into canonical topic pages can be added later without
turning the first version into a full knowledge-management platform.
