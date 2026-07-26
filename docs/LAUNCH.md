# ContextCommit launch copy

## Show HN

**Title**

Show HN: ContextCommit – capture Skill Diffs from Agent work

**Post**

Organizations can distribute a standard `SKILL.md`, but real work adds new
conditions, exceptions, priorities, and decision rules. Those changes are
usually trapped in one person's Agent session.

I built ContextCommit, an Apache 2.0 local-first framework that captures the
**Skill Diff** between the standard workflow and what actually worked, then
promotes validated changes into team or organization memory.

A Prompt Commit contains:

```text
Skill Diff + Outcome Evidence + Reuse When
```

For example, a customer-interview summary starts as a general workflow. When the
audience is an executive, a PM teaches the Agent to lead with business impact
and the decision needed, while compressing feature detail. Once validated, that
conditional branch can be applied by another PM's Agent automatically.

The harness is visible in AGENTS.md and CLAUDE.md and uses lifecycle hooks for
automatic start, context injection, and finalization. Its `skill-diff-v1`
policy discards noise, keeps personal or sensitive changes local, routes
unvalidated reusable changes to an Inbox, and publishes validated low-risk
changes for other Agents.

No LLM API. No database. No opaque memory.

Try it:

```bash
npm install -g github:junghoonwoo-stack/context-commit
cd your-project
context-commit init
```

For a team:

```bash
context-commit init --shared "/path/to/company-context"
```

Repository: https://github.com/junghoonwoo-stack/context-commit

I would especially value feedback on the Skill Diff schema, promotion policy,
and lifecycle hook experience.

## Short post

A standard Skill captures the known workflow. Real work adds conditions,
exceptions, priorities, and decisions.

ContextCommit captures that **Skill Diff**, keeps the evidence that it worked,
promotes reusable changes from personal to organization memory, and applies
published changes in future Agent sessions.

No LLM API. No database. Plain Markdown.

https://github.com/junghoonwoo-stack/context-commit
