# Node tooling

Standard library & tools for your new Node project

- Build, format, test, benchmark your application
- Extensive tree-shakeable standard library

## Getting started

Currently to use nto you need the following dependencies as well: Typescript, @zeit/ncc, prettier & fs-extra.
Run the following in a fresh directory to get started:

- `$ yarn init -yy`
- `$ yarn add -D nto typescript prettier @zeit/ncc fs-extra @types/node @zeit/ncc @types/fs-extra`
- `$ yarn nto init`

This will populate the following files: nto.json, tsconfig.json, .prettierrc and update the package.json.

The default nto.json supports the following directory structure:

```text
/
    cmd/
        my-app/             <- command line usable application
            main.ts
    internal/               <- any other source files needed for your `my-app`
    pkg/
        index.ts            <- exports everything that is public
        myPkg/
            add.ts          <- any source file
            add_test.ts     <- close by test file
    test/                   <- test directory
```

Note: If you update something in the nto.json file, make sure to run `$ nto init` again to update the
tsconfig.json & package.json files.

nto.json file reference:

```json5
{
  project: "nto", // currently only used to set package.json name correctly
  appDir: "cmd", // top level directory where your app's are
  outDir: "out", // directory for build output's. $outDir/.tmp is used as a temporary directory for the run, test and bench commands
  libDir: "pkg", // directory of source files that contain your public api
  build: {
    exclude: ["package"], // any package that should be excluded from the build. Note this will be automatically added to package.json dependencies
  },
}
```

## Commands

nto has a number of commands that will help you with building, running and testing

### init

`$ nto init`

Create nto.json or update related configuration files. 

// TODO: More extensive docs on which properties are overridden by this.

Examples: `$ nto init`

### run

`$ nto run [cmd,path/to/file.ts]`

Run a file or one of your apps. This will create a build in `./$outDir/.tmp` and execute it.

Examples: `$ nto run my-app`, `$ nto run ./pkg/myPkg/add.ts`

### build

`$ nto build [cmd*]`

Build multiple apps or compile your `$libDir` directory. When the build command does not get an argument, it will
use Typescript to transpile `$libDir` to `./$outDir/lib/$libDir` it will create an `index.js` file in `./$outDir/lib` to
re-export the files. This directory should also be used in your package.json#main property.

If the build command gets a single or more arguments it will build the corresponding apps. They will be placed
in `./$outDir/$appName/index.js`.

Examples: `$ nto build`, `$ nto build my-app`

### test

`$ nto test`

Test will find the test files, create a temporary app and execute it. To qualify as a test file it should
either be in the `test/` folder or contain `_test` in the filename.

The test framework will traverse all exported members of a file and execute functions that correspond to the
following signature: `testXxxx(t: testing.T): void | Promise<void>`.

Examples: `$ nto test`

### bench

`$ nto bench`

Bench will do almost the same as `$ nto test`, except it looks for exported functions with the following
signature: `benchmarkXxxx(b: testing.B): void | Promise<void>`.

An example benchmark function:

```typescript
export function benchmarkMyFunction(b: testing.B): void {
  for (let i = 0; i < b.N; ++i) {
    execMyFunction();
  }
}
```

The function will be called with an increasing `b.N` till a single call takes at least 1 second. Then it will
calculate how much nano seconds are spend per operation and print it out.

Example: `$ nto bench`

## Packages

- [testing](./testing.md)
- [fs](./fs.md)
