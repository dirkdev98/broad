#! /usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { format, project, runner, testing } from "../../internal";
import { rmdir, mkdir, rmdirSync, mkdirSync, writeFileSync } from "fs";

const noop = () => {};
const commandImplementations: Record<string, Function> = {
  fmt: fmt,
  build: build,
  test: test,
  bench: test.bind(null, true),
  run: run
};
const commands = Object.keys(commandImplementations);

export async function main() {
  const args = process.argv.slice(2);
  const subCommand = args[0];
  if (!subCommand || !commands.includes(subCommand)) {
    console.log(
      `Unsupported argument ${subCommand}, please use one of ${commands.join(
        ", "
      )}.`
    );
  } else {
    return Promise.resolve(
      commandImplementations[subCommand](...args.slice(1))
    );
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

  const tmpPath = process.cwd() + "/out/.tmp/";
  try {
    /**
     * Remove directory recursively
     * @param {string} dir_path
     * @see https://stackoverflow.com/a/42505874/3027390
     */
    function rimraf(dir_path: string) {
      if (fs.existsSync(dir_path)) {
        fs.readdirSync(dir_path).forEach(entry => {
          const entry_path = path.join(dir_path, entry);
          if (fs.lstatSync(entry_path).isDirectory()) {
            rimraf(entry_path);
          } else {
            fs.unlinkSync(entry_path);
          }
        });
        fs.rmdirSync(dir_path);
      }
    }

    rimraf(tmpPath);
  } catch (e) {
    console.error(e);
  }

  try {
    mkdirSync(tmpPath, { recursive: true });
  } catch (e) {
    console.error(e);
  }
  writeFileSync(process.cwd() + "/out/.tmp/test.ts", src);

  runner.run(process.cwd() + "/out/.tmp/test.ts").then(() => {
    const ms = Number(process.hrtime.bigint() - start) / 1000 / 1000;
    console.log(
      `Running ${isBench ? "benchmarks" : "tests"} for ${
        files.length
      } files took ${ms.toFixed(2)} ms.`
    );
  });
}

async function build(...args: any[]) {
  if (args.length === 0) {
    return project.buildLib();
  } else {
    return project.buildCmd(...args);
  }
}

async function run(name: string, ..._: any[]) {
  if (!name.endsWith(".js") && !name.endsWith(".ts")) {
    name = process.cwd() + `/cmd/${name}/main.ts`;
  }

  return runner.run(name);
}
