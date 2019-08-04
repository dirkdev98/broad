#! /usr/bin/env node

import { join } from "path";
import { project, runner, testing } from "../../internal";
import { fs } from "../../pkg";

export async function main() {
  const { rootDir, config } = await project.resolveConfig();
  const files = await project.resolveFiles();
  const testFiles = testing.filterTestFiles(rootDir, files);
  const src = testing.generateFile(testFiles, true);

  const outputPath = join(rootDir, config.outDir, ".tmp");
  const inputFile = join(outputPath, "test.ts");

  await fs.ensureDir(outputPath);
  await fs.rmdir(outputPath);
  await fs.ensureDir(outputPath);
  await fs.writeFile(inputFile, src);

  await runner.runFile(inputFile);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
