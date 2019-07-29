import { B, T } from "./types";

export class TestHelper implements T {
  constructor(private funcName: string, private fn: (t: T) => any) {}

  public fail(...args: any[]): void {
    throw new Error(`Error in ${this.funcName}: ${args.join(" ")}`);
  }

  public async exec(): Promise<void> {
    return this.fn(this);
  }
}

export class BenchmarkHelper implements B {
  public static counts = [
    5,
    10,
    50,
    100,
    200,
    500,
    1000,
    5000,
    10000,
    1_000_000,
    5_000_000,
    10_000_000,
    50_000_000,
    100_000_000,
  ];

  private currentIdx: number = 0;
  private start: bigint = BigInt(0);

  constructor(private funcName: string, private fn: (t: B) => any) {}

  public async exec(): Promise<void> {
    for (let i = 0; i < BenchmarkHelper.counts.length; ++i) {
      this.currentIdx = i;
      this.reset();

      const res = this.fn(this);
      if (res && typeof res.then === "function") {
        await res;
      }

      const diff = process.hrtime.bigint() - this.start;
      if (diff >= 1_000_000_000 || i === BenchmarkHelper.counts.length - 1) {
        console.log(`${this.funcName} \t${this.N} iterations \t ${diff / BigInt(this.N)} ns/op`);
        break;
      }
    }
  }

  public get N() {
    return BenchmarkHelper.counts[this.currentIdx];
  }

  public reset(): void {
    this.start = process.hrtime.bigint();
  }
}
