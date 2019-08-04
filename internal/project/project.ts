import { extname, join } from "path";
import { fs } from "../../pkg";
import { Config, resolveConfig } from "./config";

export const supportedExtensions = [".js", ".ts", ".json"];

// Returns a list of full path to files.
// This includes app files, library files and test files that end with a supported extension
export async function resolveFiles(): Promise<string[]> {
  const { rootDir, config } = await resolveConfig();

  const files = await Promise.all([
    resolveRelativeFiles(join(rootDir, config.appDir)),
    resolveRelativeFiles(join(rootDir, config.libDir)),
    resolveRelativeFiles(join(rootDir, "test")),
  ]);

  return files.flat();
}

export async function resolveRelativeFiles(searchPath: string): Promise<string[]> {
  const allFiles = await listFilesInPath(searchPath);
  const supportedFiles = [];

  for (const file of allFiles) {
    if (supportedExtensions.includes(extname(file))) {
      supportedFiles.push(file);
    }
  }

  return supportedFiles;
}

async function listFilesInPath(pathStr: string): Promise<string[]> {
  if (!(await fs.pathExists(pathStr))) {
    return [];
  }

  const filesInPathStr = await fs.readdir(pathStr);
  const result = [];

  for (const file of filesInPathStr) {
    if (file.indexOf("node_modules") !== -1) {
      continue;
    }

    const newPath = join(pathStr, file);
    if ((await fs.stat(newPath)).isDirectory()) {
      const subResult = await listFilesInPath(newPath);
      result.push(...subResult);
    } else {
      result.push(newPath);
    }
  }

  return result;
}

export async function resolveAppNames(rootDir: string, cfg: Config): Promise<string[]> {
  const result: string[] = [];

  const paths: fs.Dirent[] = (await fs.readdir(join(rootDir, cfg.appDir), ({
    withFileTypes: true,
  } as unknown) as any)) as any;
  for (const file of paths) {
    if (file.isDirectory()) {
      result.push(file.name);
    }
  }

  return result;
}
