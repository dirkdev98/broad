## Testing

The following interface is injected in to test functions:

```typescript
export interface T {
  expect(value: unknown): Matcher;
  fail(...args: any[]): void;
}
```

and in benchmark functions:

```typescript
export interface B extends T {
  N: number;
  reset(): void;
}
```

### Matcher

The matcher contains several functions to check for expected values.

- **toBe(other: unknown): Matcher**: Strict equality check on expected value and other
- **toEqual(other: unknown): Matcher**: Deep comparison on value and other. Will use `toBe` for string, number, boolean, Symbol and nil values
- **toBeTruthy(): Matcher**: Does a loosely check for any JS truthy value
- **toBeFalsy(): Matcher**: Does a loosely check for any JS falsy value
- **toBeNil(): Matcher**: Only passes with `undefined` and `null`
- **toHaveKeys(...keys: (string | number | symbol)[]): Matcher**: Checks if provided object contains all specified keys. A key with `null` as value is considered ok.
- **toResolveWith(other: unknown): Matcher**: awaits the promise and does a `toEqual` check on the result
