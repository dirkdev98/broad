#! /usr/bin/env node

import { project } from "../../internal";

export async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return project.buildLib();
  } else {
    return project.buildApps(...args);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
