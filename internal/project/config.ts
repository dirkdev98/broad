import { join } from "path";
import { fs } from "../../pkg";
import { format, project } from "../index";

export interface Config {
  project: string;
  appDir: string;
  outDir: string;
  libDir: string;
  build: {
    exclude: string[];
  };
}

export interface ResolvedConfig {
  rootDir: string;
  config: Config;
}

let cfg: ResolvedConfig | undefined = undefined;

// Will try and find the nearest nto.json file and parse it.
// Will cache the result.
export async function resolveConfig(): Promise<{
  rootDir: string;
  config: Config;
}> {
  if (cfg !== undefined) {
    return cfg;
  }

  const [ntoRoot, configPath] = await resolveConfigPath();
  const configSrc = await fs.readFile(configPath, { encoding: "utf-8" });

  cfg = {
    rootDir: ntoRoot,
    config: JSON.parse(configSrc),
  };

  return cfg;
}

async function resolveConfigPath(): Promise<[string, string]> {
  let path = process.cwd().split("/");

  while (path.length > 1) {
    const possibleConfigPath = join(path.join("/"), "nto.json");

    if (await fs.pathExists(possibleConfigPath)) {
      return [path.join("/"), possibleConfigPath];
    } else {
      path.pop();
    }
  }

  throw new Error("Can't find nto config path.");
}

export async function syncConfigFiles() {
  const { rootDir, config } = await resolveConfig();
  await syncPackageJson(rootDir, config);
  await syncPrettierrc(rootDir, config);
  await syncTsconfig(rootDir, config);
}

async function syncPackageJson(rootDir: string, cfg: Config) {
  const path = join(rootDir, "package.json");
  let contents: any = {};
  if (await fs.pathExists(path)) {
    const contentSrc = await fs.readFile(path, { encoding: "utf-8" });
    contents = JSON.parse(contentSrc);
  }

  contents.name = cfg.project;
  contents.version = contents.version || "0.1.0";
  contents.main = join(cfg.outDir, "lib/index.js");
  contents.types = join(cfg.outDir, "lib/index.d.ts");
  contents.bin = (await project.resolveAppNames(rootDir, cfg)).reduce<any>((acc, name) => {
    acc[name] = join(cfg.outDir, name, "index.js");
    return acc;
  }, {});
  contents.sideEffects = false;
  contents.type = "module";
  contents.devDependencies = contents.devDependencies || {
    nto: "latest",
    "@zeit/ncc": "0.20.4",
    typescript: "3.5.3",
    "fs-extra": "8.1.0",
    prettier: "1.18.2",
  };
  contents.dependencies = contents.dependencies || {};
  contents.files = [`${cfg.outDir}/**/*.*`, "README.md", "LICENSE", "CHANGELOG.md"];

  for (const excl of cfg.build.exclude) {
    if (contents.dependencies[excl] === undefined) {
      contents.dependencies[excl] = "latest";
    }
  }

  return fs.writeFile(path, JSON.stringify(contents, null, 2));
}

async function syncPrettierrc(rootDir: string, _: Config) {
  const path = join(rootDir, ".prettierrc");

  if (await fs.pathExists(path)) {
    return;
  }

  return fs.writeFile(path, JSON.stringify(format.prettierConfig, null, 2));
}

async function syncTsconfig(rootDir: string, cfg: Config) {
  const path = join(rootDir, "tsconfig.json");
  let contents: any = {};
  if (await fs.pathExists(path)) {
    const contentSrc = await fs.readFile(path, { encoding: "utf-8" });
    contents = JSON.parse(contentSrc);
  }

  contents.compilerOptions = contents.compilerOptions || {
    declaration: true,
    inlineSourceMap: true,
    strict: true,
    esModuleInterop: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    traceResolution: false,
    listEmittedFiles: false,
    listFiles: false,
    pretty: true,
    typeRoots: ["node_modules/@types"],
  };

  contents.compilerOptions.target = "es2019";
  contents.compilerOptions.outDir = cfg.outDir;
  contents.compilerOptions.rootDir = "./";
  contents.compilerOptions.moduleResolution = "node";
  contents.compilerOptions.lib = ["esnext"];
  contents.compilerOptions.types = ["node"];

  contents.include = ["./**/*.ts", "./**/*.js"];
  contents.exclude = ["node_modules/**", `${cfg.outDir}/**`];

  return fs.writeFile(path, JSON.stringify(contents, null, 2));
}
