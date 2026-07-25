# ContextCommit

**Make every AI work session useful to the next one.**

ContextCommit is a small, local-first layer for AI Agents such as Codex and
Claude Code. The Agent decides what mattered. ContextCommit gives that context
a lifecycle: start a session, capture the meaningful outcome, save a dated
Markdown commit, and load relevant commits into the next session.

It does **not** call an LLM. There is no API key, model configuration, database,
or additional token cost.

## Why

AI Agents become sharp when they know the current goal, constraints, decisions,
feedback, and local conditions. That context is usually lost when a session
ends.

Saving every raw conversation is noisy and risky. ContextCommit keeps a smaller
unit:

- **Outcome Diff** — what meaningfully changed
- **Prompt Trajectory** — the directions and corrections that caused the change
- **Context That Mattered** — current facts and signals worth reusing
- **Reuse When** — when a future Agent should retrieve it

Together, these form a **Prompt Commit**.

## Try it in five minutes

ContextCommit requires Node.js 18 or later.

Install directly from GitHub:

```bash
npm install -g github:junghoonwoo-stack/context-commit
```

Open any working directory and initialize it:

```bash
cd my-project
context-commit init --agent codex
```

For Claude Code:

```bash
context-commit init --agent claude
```

Start a session:

```bash
context-commit start --goal "Improve the customer onboarding proposal"
```

ContextCommit creates two working files:

- `.context-commit/CURRENT_CONTEXT.md` — relevant memory for the Agent to read
- `.context-commit/SESSION.md` — the active session draft maintained by the Agent

Work normally with your Agent. Before it finishes, the installed Agent protocol
asks it to update `SESSION.md` and run:

```bash
context-commit end --summary "Reframed onboarding around setup anxiety"
```

You can immediately see the result:

```text
my-project/
├── context-memory/
│   ├── INDEX.md
│   └── 2026-07-25/
│       └── 10-42-18-reframed-onboarding-around-setup-anxiety.md
└── .context-commit/
    ├── config.json
    └── AGENT_PROTOCOL.md
```

Start another session:

```bash
context-commit start --goal "Create onboarding messages"
```

The previous Prompt Commit is now included in
`.context-commit/CURRENT_CONTEXT.md`. The next Agent starts with the context
created by the previous one.

## How the flywheel works

```text
Agent session
    → Outcome Diff
    → Prompt Commit
    → dated Markdown memory
    → relevant context loaded next session
    → sharper Agent work
```

This is **Context Compounding**: context created by one unit of work makes the
next unit easier and more specific.

## Agent-native by design

ContextCommit is not another AI Agent.

The Agent is responsible for semantic judgment:

- what changed in a meaningful way
- which direction or correction caused that change
- which context is reusable
- what should be ignored

ContextCommit handles the deterministic parts:

- session start and end
- workspace snapshots and artifact diffs
- dated Markdown storage
- indexing and retrieval
- Agent-specific instruction files

`init --agent codex` adds a managed block to `AGENTS.md`.
`init --agent claude` adds one to `CLAUDE.md`. Existing content is preserved.

## Commands

```text
context-commit init [--memory-dir PATH] [--agent generic|codex|claude|all]
context-commit start [--goal "Current task"]
context-commit note [--type TYPE] "Meaningful context"
context-commit end [--summary "Outcome"] [--reuse-when "When useful"]
context-commit context [--goal "Current task"]
context-commit status
context-commit abandon --yes
```

Supported note types:

```text
context, decision, constraint, feedback, prompt, validation
```

`note` is optional. An Agent can edit `.context-commit/SESSION.md` directly.

## Choose where memory is stored

The default is the visible `context-memory/` folder inside the working
directory. Choose another relative or absolute path during initialization:

```bash
context-commit init --memory-dir "./team-memory" --agent all
context-commit init --memory-dir "/secure/private/context" --agent codex
```

Markdown is the source of truth. You can inspect it, edit it, commit it to Git,
sync it through another system, or keep it entirely local.

## Privacy

ContextCommit does not upload anything.

- raw conversations are not stored by default
- common inline secret patterns are redacted from CLI notes
- runtime snapshots and active session files are gitignored
- final Prompt Commits are plain Markdown under the user's control

Automated redaction is not a complete security boundary. Review Prompt Commits
before sharing or syncing them.

## Current scope

Version `0.1.0` supports:

- local-first Markdown memory
- working-directory snapshots
- text artifact diffs
- dated, session-level Prompt Commits
- goal-aware retrieval with a lightweight local relevance score
- Codex and Claude Code instruction adapters
- configurable memory paths

Planned:

- OpenClaw and Hermes adapters
- richer semantic diffs for non-code work
- approval and freshness workflows
- team sync with permissions, audit, and retention controls

## Development

```bash
git clone https://github.com/junghoonwoo-stack/context-commit.git
cd context-commit
npm test
npm run check
```

## License

Apache License 2.0. See [LICENSE](LICENSE).
