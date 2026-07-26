# ContextCommit launch copy

## Show HN

**Title**

Show HN: ContextCommit – promote Agent work into organization memory

**Post**

AI coding agents are good at finishing a task, but the context that made the
result correct often disappears with the session.

I built ContextCommit, an Apache 2.0 local-first framework that turns tacit
knowledge inside individual prompts into reusable team or organization memory.

It does not call an LLM or require an API key. It runs on top of Codex or Claude
Code.

The memory harness is visible in AGENTS.md and CLAUDE.md, applies across every
Skill in the workspace, and uses lifecycle hooks for automatic start, context
injection, and finalization.

Its `outcome-diff-v1` policy automatically discards noise, keeps personal or
sensitive context local, routes unvalidated reusable work to an Inbox, and
publishes only validated low-risk context for other Agents.

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

ContextCommit is an Apache 2.0, local-first framework that captures the context
that changed an outcome, promotes it from personal to organization memory, and
applies relevant published knowledge in future Agent sessions.

The new progressive-disclosure flow loads only a compact index first. Full
details and artifact diffs stay on disk and are opened only when needed.

No LLM API. No database. No opaque memory.

https://github.com/junghoonwoo-stack/context-commit
