# Node tooling

Standard library & tools for your new Node project

- Build, format, test, benchmark your application
- Extensive tree-shakeable standard library

## Getting started

Currently to use nto you need the following dependencies as well: Typescript, @zeit/ncc.
 Run `yarn add -D nto typescript @types/node @zeit/ncc` in a fresh directory to get started.
 
At the moment nto is not configurable at all and will assume the following directory structure:
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

## Commands

nto has a number of commands that will help you with building, running and testing

### run

`$ nto run [cmd,path/to/file.ts]`

Run a file or one of your apps. This will create a build in `./out/.tmp` and execute it.

Examples: `$ nto run my-app`, `$ nto run ./pkg/myPkg/add.ts`

### build

`$ nto build [cmd*]`

Build multiple apps or compile your `pkg` directory. When the build command does not get an argument,
it will use Typescript to transpile `pkg` to `./out/lib/pkg` it will create an `index.js` file in `./out/lib`
to re-export the files. This directory should also be used in your package.json#main property.

If the build command gets a single or more arguments it will build the corresponding apps. They will
be placed in `./out/$appName/index.js`.

Examples: `$ nto build`, `$ nto build my-app`

### test

`$ nto test`

Test will find the test files, create a temporary app and execute it. To qualify as a test file
it should either be in the `test/` folder or contain `_test` in the filename.

The test framework will traverse all exported members of a file and execute functions that correspond
to the following signature: `testXxxx(t: testing.T): void | Promise<void>`.

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

The function will be called with an increasing `b.N` till a single call takes at least 1 second.
Then it will calculate how much nano seconds are spend per operation and print it out.

Example: `$ nto bench`
