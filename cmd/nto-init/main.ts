#! /usr/bin/env node

import { join } from "path";
import { project } from "../../internal";
import { fs } from "../../pkg";

// Create nto.json (if not exists) with default values and syncs config files to create / update
// package.json, tsconfig.json & .prettierrc.
// Uses current directory as project name.
async function main() {
  if (!(await fs.pathExists(join(process.cwd(), "nto.json")))) {
    const pathParts = process.cwd().split("/");
    const projectName = pathParts[pathParts.length - 1];

    // replace with defaults constant from 'project'
    await fs.writeFile(
      "./nto.json",
      JSON.stringify(
        {
          project: projectName,
          appDir: "cmd",
          outDir: "out",
          libDir: "pkg",
          build: {
            exclude: [],
          },
        },
        null,
        2,
      ),
    );
  }
  await project.syncConfigFiles();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
