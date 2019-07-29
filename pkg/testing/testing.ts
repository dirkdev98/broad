import { join } from "path";

export function filterFiles(files: string[]): string[] {
  const result: string[] = [];
  const testDir = join(process.cwd(), "/test");

  for (const file of files) {
    if (file.startsWith(testDir) || file.includes("_test.js") || file.includes("_test.ts")) {
      result.push(file);
    }
  }

  return result;
}

export function generateFile(imports: string[], isBenchmark: boolean): string {
  let source = `import { BenchmarkHelper, TestHelper } from "broad/pkg/testing/helper";
  `;

  for (let i = 0; i < imports.length; ++i) {
    source += `import * as test${i} from "${imports[i].substr(0, imports[i].length - 3)}";\n`;
  }

  source += `\nconst sources = [\n`;
  for (let i = 0; i < imports.length; ++i) {
    source += `test${i},\n`;
  }
  source += "];\n";

  source += `
  async function main() {
    for (const src of sources) {
      for (const funcName in src) {
        if (!funcName.startsWith("test") && !${isBenchmark}) {
          continue;
        }
        if (!funcName.startsWith("benchmark") && ${isBenchmark}) {
          continue;
        }
      
        // @ts-ignore
        const fn = src[funcName];
        if (fn.length !== 1) {
          throw new Error("Exported test function with name '" + funcName + "' is not valid. Should expect a single argument"); 
        }
        const helper = ${isBenchmark} ? new BenchmarkHelper(funcName, fn) : new TestHelper(funcName, fn);
        await helper.exec();
      }
    }  
  }
  
  main().then(console.log.bind(console)).catch(console.error.bind(console));
  `;

  return source;
}

// compile all test files seperately, with some kind of hook to run them
// compile all files in single app, with some code gen, but then find some way to clear import cache between each test file
