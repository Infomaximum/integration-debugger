import { expect, test, describe } from "vitest";
import { BigIntegerValidationStrategy } from "./BigIntegerValidationStrategy";

describe("BigIntegerValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const bigIntegerValidationStrategy = new BigIntegerValidationStrategy();

    expect(bigIntegerValidationStrategy.validate(null, "a")).toHaveLength(0);
    expect(bigIntegerValidationStrategy.validate(42, "a")).toHaveLength(0);
    expect(bigIntegerValidationStrategy.validate("24", "a")).toHaveLength(0);
    expect(bigIntegerValidationStrategy.validate(25.3234, "a")).toHaveLength(0);
    expect(bigIntegerValidationStrategy.validate("25.3234", "a")).toHaveLength(0);
    expect(bigIntegerValidationStrategy.validate(0, "a")).toHaveLength(0);

    expect(bigIntegerValidationStrategy.validate(undefined, "a")).toHaveLength(1);
    expect(bigIntegerValidationStrategy.validate("25erwe", "a")).toHaveLength(1);
    expect(bigIntegerValidationStrategy.validate("25.5665qqq", "a")).toHaveLength(1);
    expect(bigIntegerValidationStrategy.validate(NaN, "a")).toHaveLength(1);
    expect(bigIntegerValidationStrategy.validate(Infinity, "a")).toHaveLength(1);
    expect(bigIntegerValidationStrategy.validate(-Infinity, "a")).toHaveLength(1);
  });
});
