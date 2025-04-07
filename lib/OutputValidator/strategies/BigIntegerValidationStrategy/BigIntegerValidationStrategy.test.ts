import { expect, test, describe } from "vitest";
import { BigIntegerValidationStrategy } from "./BigIntegerValidationStrategy";

describe("BigIntegerValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const bigIntegerValidationStrategy = new BigIntegerValidationStrategy();

    expect(bigIntegerValidationStrategy.validate(null, "a").length).toEqual(0);
    expect(bigIntegerValidationStrategy.validate(42, "a").length).toEqual(0);
    expect(bigIntegerValidationStrategy.validate("24", "a").length).toEqual(0);
    expect(bigIntegerValidationStrategy.validate(25.3234, "a").length).toEqual(0);
    expect(bigIntegerValidationStrategy.validate("25.3234", "a").length).toEqual(0);
    expect(bigIntegerValidationStrategy.validate(0, "a").length).toEqual(0);

    expect(bigIntegerValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(bigIntegerValidationStrategy.validate("25erwe", "a").length).toEqual(1);
    expect(bigIntegerValidationStrategy.validate("25.5665qqq", "a").length).toEqual(1);
    expect(bigIntegerValidationStrategy.validate(NaN, "a").length).toEqual(1);
    expect(bigIntegerValidationStrategy.validate(Infinity, "a").length).toEqual(1);
    expect(bigIntegerValidationStrategy.validate(-Infinity, "a").length).toEqual(1);
  });
});
