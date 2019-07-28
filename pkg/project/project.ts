import { readdirSync, statSync } from "fs";
import { extname, join } from "path";

export const supportedExtensions = [".js", ".ts", ".json"];

export function resolveFiles(): string[] {
  return resolveRelativeFiles("./");
}

export function resolveRelativeFiles(pathRelativeToCwd: string): string[] {
  const relativePath = join(process.cwd(), pathRelativeToCwd);

  const allFiles = listFilesInPath(relativePath);
  const supportedFiles = [];
  for (const file of allFiles) {
    if (supportedExtensions.includes(extname(file))) {
      supportedFiles.push(file);
    }
  }

  return supportedFiles;
}

function listFilesInPath(pathStr: string, list: string[] = []): string[] {
  const filesInPathStr = readdirSync(pathStr);

  for (const file of filesInPathStr) {
    if (file.indexOf("node_modules") !== -1 || file.indexOf("out") !== -1) {
      continue;
    }

    const newPath = join(pathStr, file);
    if (statSync(newPath).isDirectory()) {
      listFilesInPath(newPath, list);
    } else {
      list.push(newPath);
    }
  }

  return list;
}
