#! /usr/bin/env node

import { formatFile } from "../../pkg/format";
import { resolveFiles } from "../../pkg/project";

const noop = () => {};
const commandImplementations: Record<string, Function> = {
  fmt: fmt,
  build: noop,
  test: noop,
  bench: noop,
  run: noop,
};
const commands = Object.keys(commandImplementations);

export function main() {
  const args = process.argv.slice(2);
  const subCommand = args[0];
  if (!subCommand || !commands.includes(subCommand)) {
    console.log(`Unsupported argument ${subCommand}, please use one of ${commands.join(", ")}.`);
  } else {
    commandImplementations[subCommand]();
  }
}

main();

function fmt() {
  const start = process.hrtime.bigint();
  const files = resolveFiles();

  const fmtPromiseList = [];
  fmtPromiseList.length = files.length;

  for (const f of files) {
    fmtPromiseList.push(formatFile(f));
  }

  Promise.all(fmtPromiseList)
    .then(() => {
      const ms = Number(process.hrtime.bigint() - start) / 1000 / 1000;
      console.log(`Formatting ${files.length} files took ${ms.toFixed(2)} ms.`);
    })
    .catch(err => console.error(err));
}
