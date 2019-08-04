import { join } from "path";
import { fs } from "../../pkg";
import { project } from "../index";

export interface Config {
  project: string;
  appDir: string;
  outDir: string;
  libDir: string;
  build: {
    exclude: string[];
  };
}

export async function findConfigFile(): Promise<{
  rootDir: string;
  config: Config;
}> {
  const [ntoRoot, configPath] = await resolvePath();
  const configSrc = await fs.readFile(configPath, { encoding: "utf-8" });

  return {
    rootDir: ntoRoot,
    config: JSON.parse(configSrc),
  };
}

async function resolvePath(): Promise<[string, string]> {
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
  const { rootDir, config } = await findConfigFile();
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
  let contents: any = {
    printWidth: 110,
    tabWidth: 2,
    singleQuote: false,
    bracketSpacing: true,
    trailingComma: "all",
    arrowParens: "avoid",
    semi: true,
    proseWrap: "always",
  };

  if (await fs.pathExists(path)) {
    return;
  }

  return fs.writeFile(path, JSON.stringify(contents, null, 2));
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
