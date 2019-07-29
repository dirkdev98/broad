#! /usr/bin/env node

import { format, project, testing } from "../../pkg";

const noop = () => {};
const commandImplementations: Record<string, Function> = {
  fmt: fmt,
  build: build,
  test: test,
  bench: test.bind(null, true),
  run: noop,
};
const commands = Object.keys(commandImplementations);

export async function main() {
  const args = process.argv.slice(2);
  const subCommand = args[0];
  if (!subCommand || !commands.includes(subCommand)) {
    console.log(`Unsupported argument ${subCommand}, please use one of ${commands.join(", ")}.`);
  } else {
    return Promise.resolve(commandImplementations[subCommand](...args.slice(1)));
  }
}

main().catch(console.error.bind(console));

function fmt() {
  const start = process.hrtime.bigint();
  const files = project.resolveFiles();

  const fmtPromiseList = [];
  fmtPromiseList.length = files.length;

  for (const f of files) {
    fmtPromiseList.push(format.file(f));
  }

  Promise.all(fmtPromiseList)
    .then(() => {
      const ms = Number(process.hrtime.bigint() - start) / 1000 / 1000;
      console.log(`Formatting ${files.length} files took ${ms.toFixed(2)} ms.`);
    })
    .catch(err => console.error(err));
}

function test(isBench: boolean = false) {
  const start = process.hrtime.bigint();
  const files = project.resolveFiles();
  const testFiles = testing.filterFiles(files);
  const src = testing.generateFile(testFiles, isBench);

  // todo: run src

  const ms = Number(process.hrtime.bigint() - start) / 1000 / 1000;
  console.log(
    `Running ${isBench ? "benchmarks" : "tests"} for ${files.length} files took ${ms.toFixed(2)} ms.`,
  );
}

async function build(...args: any[]) {
  if (args.length === 0) {
    return project.buildLib();
  } else {
    return project.buildCmd(...args);
  }
}
