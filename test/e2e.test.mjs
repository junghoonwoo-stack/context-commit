import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const cli = path.join(projectRoot, "bin", "context-commit.mjs");

function run(cwd, args, options = {}) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: "utf8",
    input: options.input,
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test("zero-config init installs one visible harness for every Skill", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "context-commit-init-"));
  await mkdir(path.join(workspace, ".codex"), { recursive: true });
  await mkdir(path.join(workspace, ".claude"), { recursive: true });
  await writeFile(
    path.join(workspace, ".codex", "hooks.json"),
    JSON.stringify({
      hooks: {
        SessionStart: [
          {
            hooks: [{ type: "command", command: "echo keep-codex-hook" }],
          },
        ],
      },
    }),
  );
  await writeFile(
    path.join(workspace, ".claude", "settings.json"),
    JSON.stringify({
      permissions: { allow: ["Read"] },
      hooks: {
        PostToolUse: [
          {
            matcher: "Edit",
            hooks: [{ type: "command", command: "echo keep-claude-hook" }],
          },
        ],
      },
    }),
  );

  const output = run(workspace, ["init"]);
  assert.match(output, /Agent adapter: all/);

  const agents = await readFile(path.join(workspace, "AGENTS.md"), "utf8");
  const claude = await readFile(path.join(workspace, "CLAUDE.md"), "utf8");
  const codexHooks = await readFile(
    path.join(workspace, ".codex", "hooks.json"),
    "utf8",
  );
  const claudeSettings = await readFile(
    path.join(workspace, ".claude", "settings.json"),
    "utf8",
  );

  for (const harness of [agents, claude]) {
    assert.match(harness, /workspace-wide memory rules apply to every Skill/);
    assert.match(harness, /context-commit start --goal/);
    assert.match(harness, /\.context-commit\/CURRENT_CONTEXT\.md/);
    assert.match(harness, /context-commit end --summary/);
    assert.match(harness, /plain Markdown so/);
    assert.match(harness, /progressive disclosure/);
    assert.match(harness, /Topics: 1-5 stable/);
    assert.doesNotMatch(harness, /AGENT_PROTOCOL\.md/);
  }
  for (const hookConfig of [codexHooks, claudeSettings]) {
    assert.match(hookConfig, /context-commit hook session-start/);
    assert.match(hookConfig, /context-commit hook prompt/);
    assert.match(hookConfig, /context-commit hook session-end/);
  }
  assert.match(codexHooks, /keep-codex-hook/);
  assert.match(claudeSettings, /keep-claude-hook/);
  assert.match(claudeSettings, /"Read"/);

  run(workspace, ["init"]);
  const reinstalledCodex = await readFile(
    path.join(workspace, ".codex", "hooks.json"),
    "utf8",
  );
  const reinstalledClaude = await readFile(
    path.join(workspace, ".claude", "settings.json"),
    "utf8",
  );
  for (const hookConfig of [reinstalledCodex, reinstalledClaude]) {
    assert.equal(
      hookConfig.match(/context-commit hook session-start/g)?.length,
      1,
    );
    assert.equal(
      hookConfig.match(/context-commit hook prompt/g)?.length,
      1,
    );
    assert.equal(
      hookConfig.match(/context-commit hook session-end/g)?.length,
      1,
    );
  }
});

test("a shared path automatically routes unvalidated outcomes to the team inbox", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "context-commit-company-"));
  const sharedMemory = await mkdtemp(
    path.join(tmpdir(), "context-commit-network-drive-"),
  );

  const output = run(workspace, ["init", "--shared", sharedMemory]);
  assert.match(output, new RegExp(`Shared memory: ${escapeForRegex(sharedMemory)}`));

  run(workspace, ["start", "--goal", "Test the company memory layer"]);
  run(workspace, [
    "note",
    "--type",
    "decision",
    "A single shared path is enough for the first company setup.",
  ]);
  const endOutput = run(workspace, [
    "end",
    "--summary",
    "Verified one-path company setup",
  ]);

  assert.match(endOutput, /Shared candidate/);
  assert.match(endOutput, /Classification: team \/ candidate/);
  const sharedFiles = await findMarkdownFiles(sharedMemory);
  assert.ok(
    sharedFiles.some((file) => path.basename(file) !== "INDEX.md"),
    "expected a candidate in shared company memory",
  );
  const candidate = await readFile(
    sharedFiles.find((file) => path.basename(file) !== "INDEX.md"),
    "utf8",
  );
  assert.match(candidate, /visibility: "team"/);
  assert.match(candidate, /lifecycle: "candidate"/);
  assert.match(candidate, /promotion_policy: "outcome-diff-v1"/);
});

test("saves a dated Prompt Commit and loads it next session", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "context-commit-"));
  await writeFile(path.join(workspace, "brief.md"), "# Brief\n\nOld direction.\n");

  run(workspace, [
    "init",
    "--memory-dir",
    "work-memory",
    "--agent",
    "codex",
  ]);
  run(workspace, ["start", "--goal", "Improve the customer care brief"]);
  run(workspace, [
    "note",
    "--type",
    "context",
    "Customer interviews show setup is the main pain point.",
  ]);
  run(workspace, [
    "note",
    "--type",
    "decision",
    "Organize the brief around customer situations.",
  ]);
  const sessionDraftPath = path.join(
    workspace,
    ".context-commit",
    "SESSION.md",
  );
  const sessionDraft = await readFile(sessionDraftPath, "utf8");
  await writeFile(
    sessionDraftPath,
    sessionDraft
      .replace(
        "<!-- What meaningfully changed beyond the automatic file diff? -->",
        "The brief now prioritizes setup and ongoing care.",
      )
      .replace(
        "<!-- How the result was checked. -->",
        "- Reviewed the revised brief against the interview finding.",
      ),
  );
  await writeFile(
    path.join(workspace, "brief.md"),
    "# Brief\n\nFocus on setup and ongoing care.\n",
  );
  const output = run(workspace, [
    "end",
    "--summary",
    "Reframed the customer care brief",
    "--reuse-when",
    "Planning subscription care services",
  ]);

  assert.match(output, /Prompt Commit saved/);
  const dayFolders = await readdir(path.join(workspace, "work-memory"));
  const dateFolder = dayFolders.find((name) => /^\d{4}-\d{2}-\d{2}$/.test(name));
  assert.ok(dateFolder);
  const commitFiles = await readdir(
    path.join(workspace, "work-memory", dateFolder),
  );
  assert.equal(commitFiles.length, 1);
  const commit = await readFile(
    path.join(workspace, "work-memory", dateFolder, commitFiles[0]),
    "utf8",
  );
  assert.match(commit, /## Outcome Diff/);
  assert.match(commit, /format: context-commit\/v3/);
  assert.match(commit, /visibility: "personal"/);
  assert.match(commit, /lifecycle: "published"/);
  assert.match(commit, /sensitivity: "private"/);
  assert.match(commit, /confidence: "confirmed"/);
  assert.match(commit, /context_types:/);
  assert.match(commit, /reuse_when: "Planning subscription care services"/);
  assert.match(commit, /Customer interviews show setup/);
  assert.match(commit, /Organize the brief around customer situations/);
  assert.match(commit, /The brief now prioritizes setup and ongoing care/);
  assert.match(commit, /Reviewed the revised brief against the interview finding/);
  assert.match(commit, /\+Focus on setup and ongoing care/);

  run(workspace, [
    "start",
    "--goal",
    "Plan subscription care services",
  ]);
  const currentContext = await readFile(
    path.join(workspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.match(currentContext, /Reframed the customer care brief/);
  assert.match(currentContext, /Customer interviews show setup/);
  assert.match(currentContext, /context-commit show "local:/);
  assert.doesNotMatch(currentContext, /## Artifact Diff/);
  assert.doesNotMatch(currentContext, /\+Focus on setup and ongoing care/);

  const source = currentContext.match(/Source: `([^`]+)`/)?.[1];
  assert.ok(source);
  const details = run(workspace, ["show", source]);
  assert.match(details, /## Decisions/);
  assert.doesNotMatch(details, /## Artifact Diff/);
  const diff = run(workspace, ["show", source, "--section", "diff"]);
  assert.match(diff, /\+Focus on setup and ongoing care/);
});

test("lifecycle hooks start, inject lightweight context, and finalize", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "context-commit-hooks-"));
  await writeFile(path.join(workspace, "plan.md"), "# Plan\n\nOld.\n");
  run(workspace, ["init", "--agent", "codex"]);

  const started = run(workspace, ["hook", "session-start"]);
  assert.match(started, /session is active/);

  const injected = run(workspace, ["hook", "prompt"], {
    input: JSON.stringify({
      hook_event_name: "UserPromptSubmit",
      prompt: "Improve the rollout plan",
    }),
  });
  const hookOutput = JSON.parse(injected);
  assert.equal(
    hookOutput.hookSpecificOutput.hookEventName,
    "UserPromptSubmit",
  );
  assert.match(hookOutput.hookSpecificOutput.additionalContext, /lightweight context index/);

  const sessionPath = path.join(workspace, ".context-commit", "SESSION.md");
  const draft = await readFile(sessionPath, "utf8");
  await writeFile(
    sessionPath,
    draft
      .replace(
        "<!-- One plain-language sentence describing the result. -->",
        "Clarified rollout ownership.",
      )
      .replace(
        "<!-- Decisions made and why. -->",
        "- Assign one owner per rollout stage.",
      )
      .replace(
        "Topics: <!-- 1-5 stable, specific nouns, comma-separated -->",
        "Topics: rollout, ownership",
      )
      .replace(
        "Confidence: <!-- confirmed | working | uncertain -->",
        "Confidence: confirmed",
      ),
  );
  await writeFile(path.join(workspace, "plan.md"), "# Plan\n\nOne owner per stage.\n");
  run(workspace, ["hook", "session-end"]);

  const memoryFiles = await findMarkdownFiles(
    path.join(workspace, "context-memory"),
  );
  const commitFile = memoryFiles.find(
    (file) => path.basename(file) !== "INDEX.md",
  );
  assert.ok(commitFile);
  const commit = await readFile(commitFile, "utf8");
  assert.match(commit, /topics:\n  - "rollout"\n  - "ownership"/);
  assert.match(commit, /Assign one owner per rollout stage/);
});

test("trivial hook session ends without creating a Prompt Commit", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "context-commit-trivial-"));
  run(workspace, ["init", "--agent", "codex"]);
  run(workspace, ["hook", "session-start"]);
  run(workspace, ["hook", "session-end"]);

  const memoryFiles = await findMarkdownFiles(
    path.join(workspace, "context-memory"),
  );
  assert.equal(
    memoryFiles.filter((file) => path.basename(file) !== "INDEX.md").length,
    0,
  );
});

test("progressive disclosure keeps two large Prompt Commits lightweight", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "context-commit-compact-"));
  await writeFile(path.join(workspace, "large.md"), "# Initial\n");
  run(workspace, ["init", "--agent", "codex"]);

  run(workspace, ["start", "--goal", "Create the first operating guide"]);
  run(workspace, [
    "note",
    "--type",
    "decision",
    "Use one accountable owner for every stage.",
  ]);
  await writeFile(
    path.join(workspace, "large.md"),
    Array.from({ length: 240 }, (_, index) => `First guide line ${index}.`).join("\n"),
  );
  run(workspace, ["end", "--summary", "Created the first operating guide"]);

  run(workspace, ["start", "--goal", "Revise the second operating guide"]);
  run(workspace, [
    "note",
    "--type",
    "constraint",
    "Keep escalation paths visible.",
  ]);
  await writeFile(
    path.join(workspace, "large.md"),
    Array.from({ length: 240 }, (_, index) => `Second guide line ${index}.`).join("\n"),
  );
  run(workspace, ["end", "--summary", "Revised the second operating guide"]);

  run(workspace, ["start", "--goal", "Plan the next operating guide"]);
  const currentContext = await readFile(
    path.join(workspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.match(currentContext, /Created the first operating guide/);
  assert.match(currentContext, /Revised the second operating guide/);
  assert.doesNotMatch(currentContext, /First guide line 120/);
  assert.doesNotMatch(currentContext, /Second guide line 120/);
  assert.ok(
    currentContext.length < 4000,
    `expected lightweight context under 4,000 characters, got ${currentContext.length}`,
  );
});

test("redacts common inline secrets from notes", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "context-commit-"));
  run(workspace, ["init"]);
  run(workspace, ["start"]);
  run(workspace, [
    "note",
    "--type",
    "constraint",
    "api_key=super-secret-value",
  ]);
  run(workspace, ["end", "--summary", "Secret-safe session"]);

  const memoryRoot = path.join(
    workspace,
    "context-memory",
  );
  const dayFolders = await readdir(memoryRoot);
  const dateFolder = dayFolders.find((name) => /^\d{4}-\d{2}-\d{2}$/.test(name));
  const [commitFile] = await readdir(path.join(memoryRoot, dateFolder));
  const commit = await readFile(
    path.join(memoryRoot, dateFolder, commitFile),
    "utf8",
  );
  assert.match(commit, /api_key=\[REDACTED\]/);
  assert.doesNotMatch(commit, /super-secret-value/);
});

test("shares Prompt Commits across workspaces through organization memory", async () => {
  const sharedMemory = await mkdtemp(
    path.join(tmpdir(), "context-commit-shared-"),
  );
  const firstWorkspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-team-a-"),
  );
  const secondWorkspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-team-b-"),
  );

  run(firstWorkspace, [
    "init",
    "--shared-memory-dir",
    sharedMemory,
    "--team",
    "care-team",
    "--member",
    "alex",
  ]);
  run(firstWorkspace, [
    "start",
    "--goal",
    "Define the clinic onboarding policy",
  ]);
  run(firstWorkspace, [
    "note",
    "--type",
    "decision",
    "Use a physician review before external reports are imported.",
  ]);
  run(firstWorkspace, [
    "note",
    "--type",
    "validation",
    "The policy passed the care-team review checklist.",
  ]);
  const endOutput = run(firstWorkspace, [
    "end",
    "--summary",
    "Defined clinic onboarding policy",
  ]);
  assert.match(endOutput, /Published organization memory/);
  assert.match(endOutput, /Classification: team \/ published/);

  const sharedFiles = await findMarkdownFiles(sharedMemory);
  const sharedCommitPath = sharedFiles.find(
    (file) => path.basename(file) !== "INDEX.md",
  );
  assert.ok(sharedCommitPath);
  const sharedCommit = await readFile(sharedCommitPath, "utf8");
  assert.match(sharedCommit, /visibility: "team"/);
  assert.match(sharedCommit, /lifecycle: "published"/);
  assert.match(sharedCommit, /team: "care-team"/);
  assert.match(sharedCommit, /member: "alex"/);
  assert.match(sharedCommit, /Use a physician review/);

  run(secondWorkspace, [
    "init",
    "--shared-memory-dir",
    sharedMemory,
    "--team",
    "care-team",
    "--member",
    "sam",
  ]);
  run(secondWorkspace, [
    "start",
    "--goal",
    "Plan clinic onboarding",
  ]);
  const context = await readFile(
    path.join(secondWorkspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.match(context, /Source: `team:/);
  assert.match(context, /Defined clinic onboarding policy/);
  assert.match(context, /Use a physician review/);

  const otherTeamWorkspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-other-team-"),
  );
  run(otherTeamWorkspace, [
    "init",
    "--shared-memory-dir",
    sharedMemory,
    "--team",
    "finance-team",
  ]);
  run(otherTeamWorkspace, ["start", "--goal", "Plan clinic onboarding"]);
  const otherTeamContext = await readFile(
    path.join(otherTeamWorkspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.doesNotMatch(otherTeamContext, /Defined clinic onboarding policy/);
});

test("team candidates are visible in the inbox but are not injected", async () => {
  const sharedMemory = await mkdtemp(
    path.join(tmpdir(), "context-commit-candidate-"),
  );
  const authorWorkspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-author-"),
  );
  const readerWorkspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-reader-"),
  );

  run(authorWorkspace, [
    "init",
    "--shared",
    sharedMemory,
    "--team",
    "payments",
  ]);
  run(authorWorkspace, ["start", "--goal", "Choose the retry strategy"]);
  run(authorWorkspace, [
    "note",
    "--type",
    "decision",
    "Use the provider event ID for retry deduplication.",
  ]);
  run(authorWorkspace, [
    "end",
    "--summary",
    "Chose the retry deduplication key",
    "--reuse-when",
    "Implementing payment retries",
  ]);

  run(readerWorkspace, [
    "init",
    "--shared",
    sharedMemory,
    "--team",
    "payments",
  ]);
  run(readerWorkspace, ["start", "--goal", "Implement payment retries"]);
  const context = await readFile(
    path.join(readerWorkspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.doesNotMatch(context, /provider event ID/);
  assert.ok(
    (await findMarkdownFiles(path.join(sharedMemory, "inbox"))).some(
      (file) => path.basename(file) !== "INDEX.md",
    ),
  );
});

test("workspace policy can promote validated context organization-wide", async () => {
  const sharedMemory = await mkdtemp(
    path.join(tmpdir(), "context-commit-organization-"),
  );
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-policy-"),
  );
  run(workspace, [
    "init",
    "--shared",
    sharedMemory,
    "--team",
    "platform",
    "--promotion-target",
    "organization",
  ]);
  run(workspace, ["start", "--goal", "Standardize API retry handling"]);
  run(workspace, [
    "note",
    "--type",
    "decision",
    "All external retry handlers need a stable idempotency key.",
  ]);
  run(workspace, [
    "note",
    "--type",
    "validation",
    "The platform architecture test suite passed.",
  ]);
  const output = run(workspace, [
    "end",
    "--summary",
    "Standardized external retry handling",
    "--reuse-when",
    "Implementing any external retry handler",
  ]);
  assert.match(output, /Classification: organization \/ published/);
  const published = await findMarkdownFiles(
    path.join(sharedMemory, "knowledge", "organization"),
  );
  assert.ok(published.length > 0);
});

test("session source detection reads metadata only", async () => {
  const fakeHome = await mkdtemp(path.join(tmpdir(), "context-commit-home-"));
  await mkdir(path.join(fakeHome, ".claude", "projects"), { recursive: true });
  await mkdir(path.join(fakeHome, ".codex", "sessions"), { recursive: true });
  await writeFile(
    path.join(fakeHome, ".codex", "sessions", "secret.jsonl"),
    "must-not-be-printed",
  );

  const output = run(projectRoot, ["sources", "--home", fakeHome]);
  assert.match(output, /Claude Code/);
  assert.match(output, /Codex CLI/);
  assert.match(output, /No session contents were read, imported, or shared/);
  assert.doesNotMatch(output, /must-not-be-printed/);
});

async function findMarkdownFiles(root) {
  const results = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      if (entry.isFile() && entry.name.endsWith(".md")) results.push(absolute);
    }
  }
  await walk(root);
  return results;
}

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
