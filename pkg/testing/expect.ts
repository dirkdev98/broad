import { Matcher } from "./types";

export class TestFail extends Error {
  constructor(public expectValue: any, public matcherName: string, public matchervalue: any) {
    super(`Expect ${expectValue} ${matcherName} ${matchervalue} did fail.`);

    Object.setPrototypeOf(this, TestFail.prototype);
  }
}

export class Expect implements Matcher {
  constructor(public value: unknown) {}

  public toBe(other: unknown): Matcher {
    if (this.value !== other) {
      throw new TestFail(this.value, "toBe", other);
    }

    return this;
  }

  public toBeFalsy(): Matcher {
    if (this.value) {
      throw new TestFail(this.value, "toBeFalsy", "");
    }

    return this;
  }

  public toBeNil(): Matcher {
    if (this.value !== null && this.value !== undefined) {
      throw new TestFail(this.value, "toBeNil", "");
    }

    return this;
  }

  public toBeTruthy(): Matcher {
    if (!this.value) {
      throw new TestFail(this.value, "toBeTruthy", "");
    }

    return this;
  }

  public toEqual(other: unknown | null | undefined): Matcher {
    const throwErr = () => {
      throw new TestFail(this.value, "toEqual", other);
    };

    if ((other === null || other === undefined) && this.value !== other) {
      throwErr();
    } else {
      switch (typeof other) {
        case "undefined":
        case "number":
        case "string":
        case "bigint":
        case "symbol":
        case "boolean":
          if (this.value !== other) {
            throwErr();
          }
          break;
        case "object":
          if (Array.isArray(this.value)) {
            if (!Array.isArray(other) || this.value.length !== other.length) {
              throwErr();
            }
            for (let i = 0; i < this.value.length; ++i) {
              new Expect(this.value[i]).toEqual((other as unknown[])[i]);
            }
          } else {
            if (typeof other !== "object" || Array.isArray(other)) {
              throwErr();
            }
            const v = this.value as any;
            for (const key in v) {
              if (v.hasOwnProperty(key) !== (other as any).hasOwnProperty(key)) {
                throwErr();
              }
              new Expect(v[key]).toEqual((other as any)[key]);
            }
            for (const key in other) {
              if (typeof v[key] === "undefined") {
                throwErr();
              }
            }
          }
          break;
        case "function":
          throw new Error("Can't do an equality check with functions");
      }
    }

    return this;
  }

  /**
   * Note: If a key has value: null, this matcher won't fail
   * @param keys
   */
  public toHaveKeys(...keys: (string | number | symbol)[]): Matcher {
    if (this.value === null || typeof this.value !== "object") {
      throw new TestFail(this.value, "toHaveKeys", keys.join(","));
    }

    const v = this.value as any;
    for (const key of keys) {
      if (!v.hasOwnProperty(key) || v[key] === undefined) {
        throw new TestFail(this.value, "toHaveKey", key);
      }
    }

    return this;
  }

  public toResolveWith(other: unknown): Promise<Matcher> {
    if (typeof this.value === "function") {
      return this.value().then((value: unknown) => {
        this.value = value;
        return this.toEqual(other);
      });
    } else {
      throw new Error("toResolveWith expects value to be a function.");
    }
  }
}
