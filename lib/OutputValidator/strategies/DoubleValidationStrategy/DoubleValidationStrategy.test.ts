import { expect, test, describe } from "vitest";
import { DoubleValidationStrategy } from "./DoubleValidationStrategy";

describe("DoubleValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const doubleValidationStrategy = new DoubleValidationStrategy();

    expect(doubleValidationStrategy.validate(null, "a").length).toEqual(0);
    expect(doubleValidationStrategy.validate(42, "a").length).toEqual(0);
    expect(doubleValidationStrategy.validate("24", "a").length).toEqual(0);
    expect(doubleValidationStrategy.validate(25.3234, "a").length).toEqual(0);
    expect(doubleValidationStrategy.validate("25.3234", "a").length).toEqual(0);
    expect(doubleValidationStrategy.validate(0, "a").length).toEqual(0);

    expect(doubleValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(doubleValidationStrategy.validate("25erwe", "a").length).toEqual(1);
    expect(doubleValidationStrategy.validate("25.5665qqq", "a").length).toEqual(1);
    expect(doubleValidationStrategy.validate(NaN, "a").length).toEqual(1);
    expect(doubleValidationStrategy.validate(Infinity, "a").length).toEqual(1);
    expect(doubleValidationStrategy.validate(-Infinity, "a").length).toEqual(1);
  });
});
