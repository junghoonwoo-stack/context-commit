# Agent session sources

Agent session files are useful input for recovering missed Prompt Trajectories,
backfilling work completed before ContextCommit was installed, and supporting
multiple Agent tools. They are not organization memory by themselves.

Run:

```bash
context-commit sources
```

The command checks known local roots and reports only path, kind, size for
files, and modification time. It does not read, import, or share session
contents.

Current high-signal roots include Claude Code, Codex CLI, Hermes Agent,
OpenClaw, OpenCode, Goose, and project-local Aider history. Paths vary by
version and platform, so they remain adapter hints rather than hard
dependencies.

The path registry and safety principles reference
[akm-eval's Runtime Path Registry](https://github.com/johnfkoo951/akm-eval/blob/main/references/runtime-paths.md).

ContextCommit follows four rules:

1. Detect only paths that exist; absence does not prove a runtime was unused.
2. Keep discovery local and read-only.
3. Never open credential, token, `.env`, key, or authentication files.
4. Never copy a raw session into shared memory. A future import adapter must
   normalize and redact it, then pass only an extracted Skill Diff through the
   same promotion policy.

Hooks remain the primary real-time path. Session sources are fallback and
backfill inputs so the product does not depend on one Agent's internal format.
