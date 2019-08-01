/**
 * Interface used in testing.
 * An instance that fulfills this interface is injected in to the test functions.
 */
export interface T {
  expect(value: unknown): Matcher;
  fail(...args: any[]): void;
}

/**
 * Interface used in Benchmarking.
 * An instance that implements this interface is injected in to the benchmark functions.
 */
export interface B extends T {
  N: number;
  reset(): void;
}

export interface Matcher {
  // ===
  toBe(other: unknown): Matcher;
  // deep comparison
  toEqual(other: unknown): Matcher;

  toBeTruthy(): Matcher;
  toBeFalsy(): Matcher;
  toBeNil(): Matcher;

  toHaveKeys(...keys: (string | number | symbol)[]): Matcher;
  toResolveWith(other: unknown): Promise<Matcher>;
}
