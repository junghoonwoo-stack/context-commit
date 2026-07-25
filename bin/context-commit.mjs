#!/usr/bin/env node

import { runCli } from "../src/core.mjs";

runCli(process.argv.slice(2)).catch((error) => {
  console.error(`\nContextCommit error: ${error.message}`);
  process.exitCode = 1;
});
