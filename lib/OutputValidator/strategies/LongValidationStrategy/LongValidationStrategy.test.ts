import { expect, test, describe } from "vitest";
import { LongValidationStrategy } from "./LongValidationStrategy";

describe("LongValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const longValidationStrategy = new LongValidationStrategy();

    expect(longValidationStrategy.validate(null, "a")).toHaveLength(0);
    expect(longValidationStrategy.validate(42, "a")).toHaveLength(0);
    expect(longValidationStrategy.validate("24", "a")).toHaveLength(0);
    expect(longValidationStrategy.validate(25.3234, "a")).toHaveLength(0);
    expect(longValidationStrategy.validate("25.3234", "a")).toHaveLength(0);
    expect(longValidationStrategy.validate(0, "a")).toHaveLength(0);

    expect(longValidationStrategy.validate(undefined, "a")).toHaveLength(1);
    expect(longValidationStrategy.validate("25erwe", "a")).toHaveLength(1);
    expect(longValidationStrategy.validate("25.5665qqq", "a")).toHaveLength(1);
    expect(longValidationStrategy.validate(NaN, "a")).toHaveLength(1);
    expect(longValidationStrategy.validate(Infinity, "a")).toHaveLength(1);
  });
});
