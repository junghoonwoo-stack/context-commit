import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const cli = path.join(projectRoot, "bin", "context-commit.mjs");

function run(cwd, args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

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
