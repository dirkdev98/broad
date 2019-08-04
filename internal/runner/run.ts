import { spawnSync } from "child_process";
import { join } from "path";
import { buildApp, buildApps, resolveConfig } from "../project";

export async function runFile(file: string) {
  const { rootDir, config } = await resolveConfig();

  const fullPath = file.startsWith(process.cwd()) ? file : join(process.cwd(), file);
  const outputPath = join(rootDir, config.outDir, ".tmp");

  await buildApp(fullPath, outputPath, config.build.exclude);
  spawnSync(process.argv[0], [join(outputPath, "index.js"), ...process.argv.slice(3)]);
}

// Builds the specified app and runs it with the provided arguments
export async function runApp(appName: string) {
  await buildApps(appName);
  const { rootDir, config } = await resolveConfig();
  spawnSync(process.argv[0], [join(rootDir, config.outDir, "index.js"), ...process.argv.slice(3)]);
}
