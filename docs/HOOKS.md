# Lifecycle hooks

ContextCommit combines visible Agent instructions with deterministic lifecycle
hooks. `AGENTS.md` and `CLAUDE.md` define what the Agent should preserve. Hooks
make session start, context injection, and fallback finalization automatic.

## Installed files

`context-commit init` installs:

```text
.codex/hooks.json
.claude/settings.json
```

Existing JSON settings and unrelated hooks are preserved. Re-running `init` or
`context-commit hooks install` updates only ContextCommit hook groups.

## Lifecycle

### SessionStart

Runs:

```text
context-commit hook session-start
```

It creates an active session if none exists. It does not preload memory because
the current goal is not known yet.

### UserPromptSubmit

Runs:

```text
context-commit hook prompt
```

On the first prompt, it uses that prompt as the retrieval goal, builds the
lightweight `CURRENT_CONTEXT.md`, and injects it as additional Agent context.
It injects once per ContextCommit session to avoid repeated context growth.

### SessionEnd

Runs:

```text
context-commit hook session-end
```

It evaluates the Skill Diff, causal Prompt Trajectory, and outcome evidence.
Noise is discarded, personal context stays local, reusable unvalidated changes
become shared candidates, and validated low-risk changes are published according
to the workspace policy.

The Agent should still follow `AGENTS.md` or `CLAUDE.md`, maintain `SESSION.md`,
validate the outcome, and explicitly run `context-commit end` when meaningful
work finishes. SessionEnd is the deterministic fallback.

## Trust and verification

Project-local hooks execute commands, so Agent runtimes may require review.
After initialization, open the Agent's `/hooks` browser and trust the exact
project hooks. Changed hook definitions may require review again.

Verify installation from the terminal:

```bash
context-commit hooks status
```

Reinstall one or both adapters:

```bash
context-commit hooks install --agent codex
context-commit hooks install --agent claude
context-commit hooks install --agent all
```

Disable automatic hook installation for an unsupported runtime:

```bash
context-commit init --no-hooks
```

Manual `start`, `context`, and `end` commands remain available.
