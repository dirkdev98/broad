#! /usr/bin/env node

import { spawnSync } from "child_process";
import { join } from "path";

const ntoCommands = ["bench", "build", "fmt", "init", "run", "test"];

export function main() {
  const args = process.argv.slice(2);
  const subCommand = args[0];
  if (!subCommand || !ntoCommands.includes(subCommand)) {
    throw new Error(`Unsupported argument ${subCommand}, please use one of ${ntoCommands.join(", ")}.`);
  } else {
    runCommand(join(__dirname, `../nto-${subCommand}`, "index.js"), args.slice(1));
  }
}

main();

function runCommand(name: string, args: string[]) {
  spawnSync(name, args, { stdio: "inherit" });
}
