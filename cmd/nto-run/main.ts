#! /usr/bin/env node

import { runner } from "../../internal";

export async function main() {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    throw new Error("nto-run only expects a single argument");
  }
  const arg = args[0];

  if (arg.endsWith(".js") || arg.endsWith(".ts")) {
    return runner.runFile(arg);
  } else {
    return runner.runApp(arg);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
