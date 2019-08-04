import { join } from "path";
import * as ts from "typescript";
import { fs } from "../../pkg";
import { filterTestFiles } from "../testing";
import { resolveConfig } from "./config";
import { resolveAppNames, resolveFiles } from "./project";

const ncc = require("@zeit/ncc");

const tsConfig: ts.CompilerOptions = require("../../tsconfig.json").compilerOptions;
tsConfig.target = ts.ScriptTarget.ES2019;
tsConfig.moduleResolution = undefined;

// Took most of this code from https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
export async function buildLib() {
  const { rootDir, config } = await resolveConfig();
  const projectFiles = await resolveFiles();
  const testFiles = filterTestFiles(rootDir, projectFiles);
  const libFiles = [];
  const libPath = join(rootDir, config.libDir);

  for (const file of projectFiles) {
    if (!testFiles.includes(file) && file.startsWith(libPath)) {
      libFiles.push(file);
    }
  }

  const outDir = join(rootDir, config.outDir, "lib");
  tsConfig.outDir = outDir;
  await fs.ensureDir(outDir);

  let program = ts.createProgram(libFiles, tsConfig);
  let emitResult = program.emit();

  // easier to reexport than to move all files a level up
  await fs.writeFile(join(outDir, "index.js"), `export * from "./${config.libDir}";\n`);
  await fs.writeFile(join(outDir, "index.d.ts"), `export * from "./${config.libDir}";\n`);

  if (emitResult.emitSkipped) {
    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    console.dir(allDiagnostics);
  }
}

// Builds the specified apps, throws on invalid app name
export async function buildApps(...names: string[]) {
  const { rootDir, config } = await resolveConfig();
  const apps = await resolveAppNames(rootDir, config);

  for (const name of names) {
    if (!apps.includes(name)) {
      throw new Error(`Unknown app: ${name}`);
    }
  }

  for (const name of names) {
    await buildApp(
      join(rootDir, config.appDir, name, "main.ts"),
      join(rootDir, config.outDir, name),
      config.build.exclude,
    );
  }
}

// Takes input and output and builds a single js file,
// which include all dependency except those specified in excludes
export async function buildApp(inputFile: string, outputPath: string, excludes: string[]) {
  const result = await ncc(inputFile, {
    quiet: true,
    externals: excludes,
  });

  await fs.ensureDir(outputPath);
  await fs.writeFile(join(outputPath, "index.js"), result.code);
  await fs.chmod(join(outputPath, "index.js"), "755");

  for (const asset in result.assets) {
    if (!Object.prototype.hasOwnProperty.call(result.assets, asset)) {
      continue;
    }

    if (!asset.endsWith(".d.ts")) {
      // skip .d.ts files cause they are not useful with a 'binary'-build
      const assetDir = asset
        .split("/")
        .slice(0, -1)
        .join("/");

      await fs.ensureDir(join(outputPath, assetDir));
      await fs.writeFile(outputPath + asset, result.assets[asset]);
    }
  }
}
