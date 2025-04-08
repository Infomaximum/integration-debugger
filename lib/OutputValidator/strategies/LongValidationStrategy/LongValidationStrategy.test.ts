import { expect, test, describe } from "vitest";
import { LongValidationStrategy } from "./LongValidationStrategy";

describe("LongValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const longValidationStrategy = new LongValidationStrategy();

    expect(longValidationStrategy.validate(null, "a").length).toEqual(0);
    expect(longValidationStrategy.validate(42, "a").length).toEqual(0);
    expect(longValidationStrategy.validate("24", "a").length).toEqual(0);
    expect(longValidationStrategy.validate(25.3234, "a").length).toEqual(0);
    expect(longValidationStrategy.validate("25.3234", "a").length).toEqual(0);
    expect(longValidationStrategy.validate(0, "a").length).toEqual(0);

    expect(longValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(longValidationStrategy.validate("25erwe", "a").length).toEqual(1);
    expect(longValidationStrategy.validate("25.5665qqq", "a").length).toEqual(1);
    expect(longValidationStrategy.validate(NaN, "a").length).toEqual(1);
    expect(longValidationStrategy.validate(Infinity, "a").length).toEqual(1);
  });
});
