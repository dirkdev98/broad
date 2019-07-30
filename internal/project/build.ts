import { join } from "path";
import * as ts from "typescript";
import { ScriptTarget } from "typescript";
import { filterFiles } from "../testing";
import { resolveFiles } from "./project";
import { promises as fs } from "fs";

const ncc = require("@zeit/ncc");

const tsConfig: ts.CompilerOptions = require("../../tsconfig.json").compilerOptions;
tsConfig.outDir = join(process.cwd(), "out/lib");
tsConfig.target = ScriptTarget.ES2019;
tsConfig.moduleResolution = undefined;

// Hack around @zeit/ncc
const filterPath = (filter: string) => join(process.cwd(), filter);

// Took most of this code from https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
export async function buildLib() {
  const projectFiles = resolveFiles();
  const testFiles = filterFiles(projectFiles);
  const libFiles = [];
  const libPath = filterPath("pkg");

  for (const file of projectFiles) {
    if (!testFiles.includes(file) && file.startsWith(libPath)) {
      libFiles.push(file);
    }
  }

  try {
    await fs.mkdir(tsConfig.outDir!);
  } catch (e) {
    console.error(e);
  }

  let program = ts.createProgram(libFiles, tsConfig);
  let emitResult = program.emit();

  // easier to reexport than to move all files a level up
  await fs.writeFile(join(tsConfig.outDir!, "index.js"), `export * from "./pkg";\n`);
  await fs.writeFile(join(tsConfig.outDir!, "index.d.ts"), `export * from "./pkg";\n`);

  if (emitResult.emitSkipped) {
    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        console.log(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`);
      }
    });
  }
}

export async function buildCmd(...names: string[]) {
  for (const name of names) {
    await buildWithPaths(process.cwd() + `/cmd/${name}/main.ts`, process.cwd() + `/out/${name}/`);
  }
}

export async function buildWithPaths(inputPath: string, outputPath: string) {
  const result = await ncc(inputPath, {
    quiet: true,
    externals: ["typescript", "@zeit/ncc"],
  });

  try {
    await fs.mkdir(outputPath, { recursive: true });
  } catch (e) {
    // most likely directory exists
    console.error(e);
  }

  await fs.writeFile(outputPath + "index.js", result.code);
  for (const asset in result.assets) {
    // noinspection JSUnfilteredForInLoop

    if (!asset.endsWith(".d.ts")) {
      // skip .d.ts files cause they are not useful with a 'binary'-build
      const assetDir = asset
        .split("/")
        .slice(0, -1)
        .join("/");
      try {
        await fs.mkdir(outputPath + assetDir, { recursive: true });
      } catch (e) {
        // most likely directory exists
        console.error(e);
      }
      await fs.writeFile(outputPath + asset, result.assets[asset]);
    }
  }
}
