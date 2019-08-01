import { Expect } from "./expect";
import { T } from "./types";

const tryResultWrap = (fn: Function) => {
  try {
    const result = fn();
    return { result };
  } catch (e) {
    return { error: e };
  }
};

const shouldThrowWrap = (t: T, fn: Function) => {
  const result = tryResultWrap(fn);
  if (result.error === undefined) {
    t.fail(result);
  }
};

const shouldReturnWrap = (t: T, fn: Function) => {
  const result = tryResultWrap(fn);
  if (result.error !== undefined) {
    t.fail(result);
  }
};

export function testExpectToBe(t: T) {
  type ToBeCase = [unknown, unknown, (t: T, fn: Function) => void];

  const cases: ToBeCase[] = [
    // null
    [null, null, shouldReturnWrap],
    [null, undefined, shouldThrowWrap],
    [null, 4, shouldThrowWrap],
    [null, "foo", shouldThrowWrap],
    [null, false, shouldThrowWrap],
    [null, true, shouldThrowWrap],
    // undefined
    [undefined, undefined, shouldReturnWrap],
    [undefined, null, shouldThrowWrap],
    [undefined, 4, shouldThrowWrap],
    [undefined, "foo", shouldThrowWrap],
    [undefined, false, shouldThrowWrap],
    [undefined, true, shouldThrowWrap],

    // number
    [4, 4, shouldReturnWrap],
    [4, null, shouldThrowWrap],
    [4, undefined, shouldThrowWrap],
    [4, 5, shouldThrowWrap],
    [4, "foo", shouldThrowWrap],
    [4, false, shouldThrowWrap],
    [4, true, shouldThrowWrap],

    // string
    ["foo", "foo", shouldReturnWrap],
    ["foo", null, shouldThrowWrap],
    ["foo", undefined, shouldThrowWrap],
    ["foo", 5, shouldThrowWrap],
    ["foo", "bar", shouldThrowWrap],
    ["foo", false, shouldThrowWrap],
    ["foo", true, shouldThrowWrap],

    // boolean
    [true, true, shouldReturnWrap],
    [true, null, shouldThrowWrap],
    [true, undefined, shouldThrowWrap],
    [true, 5, shouldThrowWrap],
    [true, "foo", shouldThrowWrap],
    [true, false, shouldThrowWrap],
    [false, false, shouldReturnWrap],
    [false, null, shouldThrowWrap],
    [false, undefined, shouldThrowWrap],
    [false, 5, shouldThrowWrap],
    [false, "foo", shouldThrowWrap],

    // array & object
    [{}, {}, shouldThrowWrap],
    [{}, [], shouldThrowWrap],
    [{}, null, shouldThrowWrap],
    [{}, undefined, shouldThrowWrap],
    [{}, 5, shouldThrowWrap],
    [{}, "foo", shouldThrowWrap],
    [{}, false, shouldThrowWrap],
    [[], [], shouldThrowWrap],
    [[], {}, shouldThrowWrap],
    [[], null, shouldThrowWrap],
    [[], undefined, shouldThrowWrap],
    [[], 5, shouldThrowWrap],
    [[], "foo", shouldThrowWrap],
    [[], false, shouldThrowWrap],
  ];

  for (const c of cases) {
    c[2](t, () => new Expect(c[0]).toBe(c[1]));
  }
}

export function testExpectToEqual(t: T) {
  type ToEqualCase = [unknown, unknown, (t: T, fn: Function) => void];

  const cases: ToEqualCase[] = [
    // null
    [null, null, shouldReturnWrap],
    [null, undefined, shouldThrowWrap],
    [null, 4, shouldThrowWrap],
    [null, "foo", shouldThrowWrap],
    [null, false, shouldThrowWrap],
    [null, true, shouldThrowWrap],
    // undefined
    [undefined, undefined, shouldReturnWrap],
    [undefined, null, shouldThrowWrap],
    [undefined, 4, shouldThrowWrap],
    [undefined, "foo", shouldThrowWrap],
    [undefined, false, shouldThrowWrap],
    [undefined, true, shouldThrowWrap],

    // number
    [4, 4, shouldReturnWrap],
    [4, null, shouldThrowWrap],
    [4, undefined, shouldThrowWrap],
    [4, 5, shouldThrowWrap],
    [4, "foo", shouldThrowWrap],
    [4, false, shouldThrowWrap],
    [4, true, shouldThrowWrap],

    // string
    ["foo", "foo", shouldReturnWrap],
    ["foo", null, shouldThrowWrap],
    ["foo", undefined, shouldThrowWrap],
    ["foo", 5, shouldThrowWrap],
    ["foo", "bar", shouldThrowWrap],
    ["foo", false, shouldThrowWrap],
    ["foo", true, shouldThrowWrap],

    // boolean
    [true, true, shouldReturnWrap],
    [true, null, shouldThrowWrap],
    [true, undefined, shouldThrowWrap],
    [true, 5, shouldThrowWrap],
    [true, "foo", shouldThrowWrap],
    [true, false, shouldThrowWrap],
    [false, false, shouldReturnWrap],
    [false, null, shouldThrowWrap],
    [false, undefined, shouldThrowWrap],
    [false, 5, shouldThrowWrap],
    [false, "foo", shouldThrowWrap],

    // object
    [{}, {}, shouldReturnWrap],
    [{ foo: "bar" }, { foo: "bar" }, shouldReturnWrap],
    [{ foo: "bar", baz: [11] }, { foo: "bar", baz: [11] }, shouldReturnWrap],
    [{ foo: "bar" }, { foo: "bar", baz: 1 }, shouldThrowWrap],
    [{}, [], shouldThrowWrap],
    [{}, null, shouldThrowWrap],
    [{}, undefined, shouldThrowWrap],
    [{}, 5, shouldThrowWrap],
    [{}, "foo", shouldThrowWrap],
    [{}, false, shouldThrowWrap],

    // array
    [[], [], shouldReturnWrap],
    [[1], [1], shouldReturnWrap],
    [[1], [2], shouldThrowWrap],
    [[{ foo: "bar" }], [{ foo: "bar" }], shouldReturnWrap],
    [[], {}, shouldThrowWrap],
    [[], null, shouldThrowWrap],
    [[], undefined, shouldThrowWrap],
    [[], 5, shouldThrowWrap],
    [[], "foo", shouldThrowWrap],
    [[], false, shouldThrowWrap],
  ];

  for (const c of cases) {
    c[2](t, () => new Expect(c[0]).toEqual(c[1]));
  }
}

export function testExpectToBeFalsy(t: T) {
  type ToBeFalsyCase = [unknown, (t: T, fn: Function) => void];

  const cases: ToBeFalsyCase[] = [
    [false, shouldReturnWrap],
    [null, shouldReturnWrap],
    [undefined, shouldReturnWrap],
    [0, shouldReturnWrap],
    [true, shouldThrowWrap],
    ["x", shouldThrowWrap],
    [5, shouldThrowWrap],
    [{}, shouldThrowWrap],
    [[], shouldThrowWrap],
  ];

  for (const c of cases) {
    c[1](t, () => new Expect(c[0]).toBeFalsy());
  }
}

export function testExpectToBeTruthy(t: T) {
  type ToBeTruthyCase = [unknown, (t: T, fn: Function) => void];

  const cases: ToBeTruthyCase[] = [
    [false, shouldThrowWrap],
    [null, shouldThrowWrap],
    [undefined, shouldThrowWrap],
    [0, shouldThrowWrap],
    [true, shouldReturnWrap],
    ["x", shouldReturnWrap],
    [5, shouldReturnWrap],
    [{}, shouldReturnWrap],
    [[], shouldReturnWrap],
  ];

  for (const c of cases) {
    c[1](t, () => new Expect(c[0]).toBeTruthy());
  }
}

export function testExpectToBeNil(t: T) {
  type ToBeNilCase = [unknown, (t: T, fn: Function) => void];

  const cases: ToBeNilCase[] = [
    [null, shouldReturnWrap],
    [undefined, shouldReturnWrap],
    [false, shouldThrowWrap],
    [0, shouldThrowWrap],
    [true, shouldThrowWrap],
    ["x", shouldThrowWrap],
    [5, shouldThrowWrap],
    [{}, shouldThrowWrap],
    [[], shouldThrowWrap],
  ];

  for (const c of cases) {
    c[1](t, () => new Expect(c[0]).toBeNil());
  }
}

export function testExpectToHaveKeys(t: T) {
  type ToHaveKeysCase = [any, (string | number | symbol)[], (t: T, fn: Function) => void];

  const testSymbol = Symbol.for("foo");
  const testObj = {
    str: "",
    int: 35,
    [testSymbol]: "symbol",
    nll: null,
    undef: undefined,
    1: "intkey",
  };

  const cases: ToHaveKeysCase[] = [
    [null, [], shouldThrowWrap],
    [undefined, [], shouldThrowWrap],
    [true, [], shouldThrowWrap],
    [false, [], shouldThrowWrap],
    [24, [], shouldThrowWrap],
    ["foo", [], shouldThrowWrap],
    [testObj, [], shouldReturnWrap],
    [testObj, [testSymbol], shouldReturnWrap],
    [testObj, [1], shouldReturnWrap],
    [testObj, ["str"], shouldReturnWrap],
    [testObj, ["str", testSymbol, 1], shouldReturnWrap],
    [testObj, ["int", "nll"], shouldReturnWrap],
    [testObj, ["int", "undef"], shouldThrowWrap],
    [testObj, ["nope"], shouldThrowWrap],
  ];

  for (const c of cases) {
    c[2](t, () => new Expect(c[0]).toHaveKeys(...c[1]));
  }
}

export async function testExpectToResolveWith(t: T) {
  type ToResolveWithCase = [unknown, unknown, boolean];

  const cases: ToResolveWithCase[] = [
    // null
    [null, null, true],
    [null, undefined, false],
    [null, 4, false],
    [null, "foo", false],
    [null, false, false],
    [null, true, false],
    // undefined
    [undefined, undefined, true],
    [undefined, null, false],
    [undefined, 4, false],
    [undefined, "foo", false],
    [undefined, false, false],
    [undefined, true, false],

    // number
    [4, 4, true],
    [4, null, false],
    [4, undefined, false],
    [4, 5, false],
    [4, "foo", false],
    [4, false, false],
    [4, true, false],

    // string
    ["foo", "foo", true],
    ["foo", null, false],
    ["foo", undefined, false],
    ["foo", 5, false],
    ["foo", "bar", false],
    ["foo", false, false],
    ["foo", true, false],

    // boolean
    [true, true, true],
    [true, null, false],
    [true, undefined, false],
    [true, 5, false],
    [true, "foo", false],
    [true, false, false],
    [false, false, true],
    [false, null, false],
    [false, undefined, false],
    [false, 5, false],
    [false, "foo", false],

    // object
    [{}, {}, true],
    [{ foo: "bar" }, { foo: "bar" }, true],
    [{ foo: "bar", baz: [11] }, { foo: "bar", baz: [11] }, true],
    [{ foo: "bar" }, { foo: "bar", baz: 1 }, false],
    [{}, [], false],
    [{}, null, false],
    [{}, undefined, false],
    [{}, 5, false],
    [{}, "foo", false],
    [{}, false, false],

    // array
    [[], [], true],
    [[1], [1], true],
    [[1], [2], false],
    [[{ foo: "bar" }], [{ foo: "bar" }], true],
    [[], {}, false],
    [[], null, false],
    [[], undefined, false],
    [[], 5, false],
    [[], "foo", false],
    [[], false, false],
  ];

  for (const c of cases) {
    try {
      const thing = await new Expect(async () => c[0]).toResolveWith(c[1]);
      if (!c[2]) {
        t.fail(thing);
      }
    } catch (e) {
      if (c[2]) {
        t.fail(e);
      }
    }
  }
}
