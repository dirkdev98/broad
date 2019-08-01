import { spawnSync } from "child_process";
import { buildWithPaths } from "../project";

export async function run(runPath: string) {
  await buildWithPaths(runPath, process.cwd() + "/out/.tmp/run/");
  spawnSync(process.argv[0], [process.cwd() + "/out/.tmp/run/index.js", ...process.argv.slice(4)], {
    stdio: "inherit",
  });
}
