# ContextCommit launch copy

## Show HN

**Title**

Show HN: ContextCommit – visible, editable memory for Codex and Claude Code

**Post**

AI coding agents are good at finishing a task, but the context that made the
result correct often disappears with the session.

I built ContextCommit, an Apache 2.0 local-first layer that saves meaningful
session outcomes as dated Markdown and gives relevant context to the next
session.

It does not call an LLM or require an API key. It runs on top of Codex or Claude
Code.

The memory harness is visible in AGENTS.md and CLAUDE.md, applies across every
Skill in the workspace, and uses lifecycle hooks for automatic start, context
injection, and finalization.

It also uses progressive disclosure: the Agent first sees a small context
index, opens full details only when needed, and loads artifact diffs only when
exact evidence matters. In the E2E test, 9,102 characters of complete Prompt
Commits become a 1,530-character current context while the originals remain
editable Markdown.

Try it:

```bash
npm install -g github:junghoonwoo-stack/context-commit
cd your-project
context-commit init
```

For a team, point it at a network drive or synchronized SharePoint folder:

```bash
context-commit init --shared "/path/to/company-context"
```

Repository: https://github.com/junghoonwoo-stack/context-commit

I would especially value feedback on the metadata schema, retrieval behavior,
and lifecycle hook experience.

## Short post

Git preserves what changed. ContextCommit preserves the context that made it
change.

ContextCommit is an Apache 2.0, local-first memory layer for Codex and Claude
Code. It saves meaningful AI work outcomes as dated Markdown, applies across
all Skills through AGENTS.md/CLAUDE.md, and uses lifecycle hooks to make the
memory loop automatic.

The new progressive-disclosure flow loads only a compact index first. Full
details and artifact diffs stay on disk and are opened only when needed.

No LLM API. No database. No opaque memory.

https://github.com/junghoonwoo-stack/context-commit
