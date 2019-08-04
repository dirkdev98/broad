#! /usr/bin/env node

import { format, project } from "../../internal";

export async function main() {
  const files = await project.resolveFiles();

  const fmtPromiseList = [];
  for (const f of files) {
    fmtPromiseList.push(format.file(f));
  }

  const fmtResult = await Promise.all(fmtPromiseList);

  let didChange = false;
  for (const result of fmtResult) {
    if (result.hasChanged) {
      didChange = true;
      console.log(`Formatted ${result.path}`);
    }
  }

  process.exit(didChange ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
