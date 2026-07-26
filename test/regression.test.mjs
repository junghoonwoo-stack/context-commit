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

function runRaw(cwd, args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: "utf8",
    input: options.input,
  });
}

function run(cwd, args, options = {}) {
  const result = runRaw(cwd, args, options);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

async function findMarkdownFiles(root) {
  const results = [];
  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      if (entry.isFile() && entry.name.endsWith(".md")) results.push(absolute);
    }
  }
  await walk(root);
  return results;
}

async function createValidatedSkillDiff(workspace, sensitivity, extra = []) {
  run(workspace, ["start", "--goal", "Adapt an operating Skill"]);
  run(workspace, ["note", "--type", "base_skill", "operating-review"]);
  run(workspace, [
    "note",
    "--type",
    "skill_diff",
    "When the audience is external, remove internal assumptions.",
  ]);
  run(workspace, [
    "note",
    "--type",
    "validation",
    "The workflow owner approved the adapted output.",
  ]);
  return run(workspace, [
    "end",
    "--summary",
    `Adapted ${sensitivity} operating review`,
    "--reuse-when",
    "Preparing an external operating review",
    "--sensitivity",
    sensitivity,
    ...extra,
  ]);
}

test("private, confidential, and restricted Skill Diffs never enter shared memory", async (t) => {
  for (const sensitivity of ["private", "confidential", "restricted"]) {
    await t.test(sensitivity, async () => {
      const workspace = await mkdtemp(
        path.join(tmpdir(), `context-commit-${sensitivity}-`),
      );
      const shared = await mkdtemp(
        path.join(tmpdir(), `context-commit-${sensitivity}-shared-`),
      );
      run(workspace, ["init", "--shared", shared]);

      const output = await createValidatedSkillDiff(workspace, sensitivity);
      assert.match(output, /Classification: personal \/ published/);
      assert.match(
        output,
        new RegExp(`kept local: sensitivity is ${sensitivity}`),
      );

      const sharedCommits = (await findMarkdownFiles(shared)).filter(
        (file) => path.basename(file) !== "INDEX.md",
      );
      assert.equal(sharedCommits.length, 0);
    });
  }
});

test("public and internal validated Skill Diffs are published", async (t) => {
  for (const sensitivity of ["public", "internal"]) {
    await t.test(sensitivity, async () => {
      const workspace = await mkdtemp(
        path.join(tmpdir(), `context-commit-${sensitivity}-`),
      );
      const shared = await mkdtemp(
        path.join(tmpdir(), `context-commit-${sensitivity}-shared-`),
      );
      run(workspace, ["init", "--shared", shared, "--team", "operations"]);

      const output = await createValidatedSkillDiff(workspace, sensitivity);
      assert.match(output, /Classification: team \/ published/);
      assert.match(output, /Published organization memory/);

      const published = await findMarkdownFiles(
        path.join(shared, "knowledge", "team", "operations"),
      );
      assert.equal(published.length, 1);
    });
  }
});

test("explicit uncertain confidence prevents auto-publication despite validation", async () => {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-uncertain-"),
  );
  const shared = await mkdtemp(
    path.join(tmpdir(), "context-commit-uncertain-shared-"),
  );
  run(workspace, ["init", "--shared", shared, "--team", "operations"]);

  const output = await createValidatedSkillDiff(workspace, "internal", [
    "--confidence",
    "uncertain",
  ]);
  assert.match(output, /Classification: team \/ candidate/);
  assert.match(output, /needs validation/);

  const inbox = await findMarkdownFiles(
    path.join(shared, "inbox", "team", "operations"),
  );
  const knowledge = await findMarkdownFiles(
    path.join(shared, "knowledge", "team", "operations"),
  );
  assert.equal(inbox.length, 1);
  assert.equal(knowledge.length, 0);
});

test("organization Skill memory is visible across teams", async () => {
  const shared = await mkdtemp(
    path.join(tmpdir(), "context-commit-org-shared-"),
  );
  const author = await mkdtemp(
    path.join(tmpdir(), "context-commit-org-author-"),
  );
  const reader = await mkdtemp(
    path.join(tmpdir(), "context-commit-org-reader-"),
  );

  run(author, [
    "init",
    "--shared",
    shared,
    "--team",
    "research",
    "--promotion-target",
    "organization",
  ]);
  await createValidatedSkillDiff(author, "internal");

  run(reader, ["init", "--shared", shared, "--team", "finance"]);
  run(reader, ["start", "--goal", "Prepare an external operating review"]);
  const context = await readFile(
    path.join(reader, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.match(context, /Source: `organization:/);
  assert.match(context, /When the audience is external/);
});

test("equally relevant organization and team knowledge rank before local memory", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "context-commit-priority-"));
  const shared = path.join(root, "a-shared");
  const workspace = path.join(root, "z-workspace");
  await mkdir(workspace, { recursive: true });
  run(workspace, [
    "init",
    "--shared",
    shared,
    "--team",
    "research",
    "--no-hooks",
  ]);

  const localDir = path.join(workspace, "context-memory", "2026-07-20");
  const teamDir = path.join(
    shared,
    "knowledge",
    "team",
    "research",
    "source",
    "2026-07-20",
  );
  const organizationDir = path.join(
    shared,
    "knowledge",
    "organization",
    "source",
    "2026-07-20",
  );
  await Promise.all([
    mkdir(localDir, { recursive: true }),
    mkdir(teamDir, { recursive: true }),
    mkdir(organizationDir, { recursive: true }),
  ]);
  await Promise.all([
    writeMemory(
      path.join(localDir, "rule.md"),
      "local-rule",
      "personal",
      "Apply the approved sequence.",
    ),
    writeMemory(
      path.join(teamDir, "rule.md"),
      "team-rule",
      "team",
      "Apply the approved sequence.",
    ),
    writeMemory(
      path.join(organizationDir, "rule.md"),
      "organization-rule",
      "organization",
      "Apply the approved sequence.",
    ),
  ]);

  run(workspace, ["context", "--goal", "Standard"]);
  const context = await readFile(
    path.join(workspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  const sources = [
    ...context.matchAll(/Source: `(organization|team|local):/g),
  ].map((match) => match[1]);
  assert.deepEqual(sources.slice(0, 3), ["organization", "team", "local"]);
});

test("published organization knowledge wins when the same commit id also exists locally", async () => {
  const root = await mkdtemp(
    path.join(tmpdir(), "context-commit-priority-dedup-"),
  );
  const shared = path.join(root, "a-shared");
  const workspace = path.join(root, "z-workspace");
  await mkdir(workspace, { recursive: true });
  run(workspace, [
    "init",
    "--shared",
    shared,
    "--team",
    "research",
    "--no-hooks",
  ]);

  const localFile = path.join(
    workspace,
    "context-memory",
    "2026-07-20",
    "review-rule.md",
  );
  const organizationFile = path.join(
    shared,
    "knowledge",
    "organization",
    "source",
    "2026-07-20",
    "review-rule.md",
  );
  await Promise.all([
    mkdir(path.dirname(localFile), { recursive: true }),
    mkdir(path.dirname(organizationFile), { recursive: true }),
  ]);
  await writeMemory(
    localFile,
    "same-rule-id",
    "personal",
    "Use the stale local review rule",
  );
  await writeMemory(
    organizationFile,
    "same-rule-id",
    "organization",
    "Use the current organization review rule",
  );

  run(workspace, ["context", "--goal", "Standard"]);
  const context = await readFile(
    path.join(workspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.match(context, /Source: `organization:/);
  assert.match(context, /current organization review rule/);
  assert.doesNotMatch(context, /stale local review rule/);
});

test("legacy v3 Outcome Diff remains readable as Outcome Evidence", async () => {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-legacy-v3-"),
  );
  run(workspace, ["init", "--no-hooks"]);
  const memoryDir = path.join(workspace, "context-memory", "2026-07-20");
  await mkdir(memoryDir, { recursive: true });
  await writeFile(
    path.join(memoryDir, "legacy-v3.md"),
    `---
format: context-commit/v3
id: "legacy-v3"
ended_at: "2026-07-20T10:00:00.000Z"
fresh_until: "2026-10-20T10:00:00.000Z"
scope: "personal"
status: "active"
summary: "Legacy executive summary rule"
reuse_when: "Preparing executive summaries"
topics:
  - "executive summary"
---

# Legacy executive summary rule

## Outcome Diff

- Put the decision needed before supporting detail.

## Reuse When

Preparing executive summaries.
`,
  );

  run(workspace, ["start", "--goal", "Prepare an executive summary"]);
  const context = await readFile(
    path.join(workspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.match(context, /Legacy executive summary rule/);
  assert.match(context, /### Outcome Evidence/);
  assert.match(context, /Put the decision needed before supporting detail/);
});

test("legacy archived or superseded commits are not injected", async () => {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-legacy-filter-"),
  );
  run(workspace, ["init", "--no-hooks"]);
  const memoryDir = path.join(workspace, "context-memory", "2026-07-20");
  await mkdir(memoryDir, { recursive: true });

  for (const [name, status] of [
    ["archived-rule", "archived"],
    ["superseded-rule", "superseded"],
  ]) {
    await writeFile(
      path.join(memoryDir, `${name}.md`),
      `---
format: context-commit/v2
id: "${name}"
status: "${status}"
summary: "${name}"
reuse_when: "Preparing executive summaries"
---

# ${name}

## Outcome Diff

- This stale rule must not be loaded.
`,
    );
  }

  run(workspace, ["start", "--goal", "Prepare an executive summary"]);
  const context = await readFile(
    path.join(workspace, ".context-commit", "CURRENT_CONTEXT.md"),
    "utf8",
  );
  assert.doesNotMatch(context, /stale rule must not be loaded/);
});

test("show rejects path traversal outside a configured memory root", async () => {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-traversal-"),
  );
  run(workspace, ["init", "--no-hooks"]);
  const result = runRaw(workspace, ["show", "local:../../etc/passwd"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Context source not found/);
  assert.doesNotMatch(result.stdout, /root:/);
});

test("common inline secrets are redacted from every persisted Prompt Commit field", async () => {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-secret-fields-"),
  );
  await writeFile(
    path.join(workspace, "result.md"),
    "# Result\n\nNo credentials yet.\n",
  );
  run(workspace, ["init", "--no-hooks"]);
  run(workspace, [
    "start",
    "--goal",
    "Review token=goal-secret-value before release",
  ]);
  run(workspace, [
    "note",
    "--type",
    "skill_diff",
    "When external, remove api_key=note-secret-value",
  ]);
  run(workspace, [
    "note",
    "--type",
    "validation",
    "Validated with password=validation-secret-value",
  ]);
  await writeFile(
    path.join(workspace, "result.md"),
    "# Result\n\nsecret=artifact-secret-value\n",
  );
  run(workspace, [
    "end",
    "--summary",
    "Removed token=summary-secret-value",
    "--outcome",
    "Approved with api_key=outcome-secret-value",
    "--reuse-when",
    "When password=reuse-secret-value appears",
  ]);

  const commits = (
    await findMarkdownFiles(path.join(workspace, "context-memory"))
  ).filter((file) => path.basename(file) !== "INDEX.md");
  assert.equal(commits.length, 1);
  const commit = await readFile(commits[0], "utf8");
  for (const secret of [
    "goal-secret-value",
    "note-secret-value",
    "validation-secret-value",
    "artifact-secret-value",
    "summary-secret-value",
    "outcome-secret-value",
    "reuse-secret-value",
  ]) {
    assert.doesNotMatch(commit, new RegExp(secret));
  }
});

test("CLI errors are non-zero and explain the recovery action", async () => {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-errors-"),
  );

  const beforeInit = runRaw(workspace, ["status"]);
  assert.equal(beforeInit.status, 1);
  assert.match(beforeInit.stderr, /Run "context-commit init" first/);

  run(workspace, ["init", "--no-hooks"]);
  const noteWithoutSession = runRaw(workspace, ["note", "orphan note"]);
  assert.equal(noteWithoutSession.status, 1);
  assert.match(noteWithoutSession.stderr, /Run "context-commit start" first/);

  run(workspace, ["start", "--goal", "Test errors"]);
  const duplicateStart = runRaw(workspace, ["start"]);
  assert.equal(duplicateStart.status, 1);
  assert.match(duplicateStart.stderr, /already active/);

  const unknownType = runRaw(workspace, [
    "note",
    "--type",
    "unknown",
    "invalid",
  ]);
  assert.equal(unknownType.status, 1);
  assert.match(unknownType.stderr, /Unknown note type/);

  const abandonWithoutYes = runRaw(workspace, ["abandon"]);
  assert.equal(abandonWithoutYes.status, 1);
  assert.match(abandonWithoutYes.stderr, /abandon --yes/);
  run(workspace, ["abandon", "--yes"]);
});

test("nested directories resolve the nearest initialized workspace", async () => {
  const workspace = await mkdtemp(
    path.join(tmpdir(), "context-commit-nested-"),
  );
  const nested = path.join(workspace, "src", "feature");
  await mkdir(nested, { recursive: true });
  run(workspace, ["init", "--no-hooks"]);

  const output = run(nested, ["status"]);
  assert.match(output, new RegExp(`Workspace: ${escapeForRegex(workspace)}`));
});

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function writeMemory(file, id, visibility, skillDiff) {
  await writeFile(
    file,
    `---
format: context-commit/v4
id: "${id}"
ended_at: "2026-07-20T10:00:00.000Z"
fresh_until: "2026-10-20T10:00:00.000Z"
visibility: "${visibility}"
lifecycle: "published"
summary: "Standard review rule"
reuse_when: "Preparing a standard review"
topics:
  - "standard review"
---

# Standard review rule

## Skill Diff

- ${skillDiff}

## Outcome Evidence

- Workflow owner approved.

## Reuse When

Preparing a standard review.
`,
  );
}
