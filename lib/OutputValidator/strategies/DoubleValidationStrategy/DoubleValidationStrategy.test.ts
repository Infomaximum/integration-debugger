import { expect, test, describe } from "vitest";
import { DoubleValidationStrategy } from "./DoubleValidationStrategy";

describe("DoubleValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const doubleValidationStrategy = new DoubleValidationStrategy();

    expect(doubleValidationStrategy.validate(null, "a")).toHaveLength(0);
    expect(doubleValidationStrategy.validate(42, "a")).toHaveLength(0);
    expect(doubleValidationStrategy.validate("24", "a")).toHaveLength(0);
    expect(doubleValidationStrategy.validate(25.3234, "a")).toHaveLength(0);
    expect(doubleValidationStrategy.validate("25.3234", "a")).toHaveLength(0);
    expect(doubleValidationStrategy.validate(0, "a")).toHaveLength(0);

    expect(doubleValidationStrategy.validate(undefined, "a")).toHaveLength(1);
    expect(doubleValidationStrategy.validate("25erwe", "a")).toHaveLength(1);
    expect(doubleValidationStrategy.validate("25.5665qqq", "a")).toHaveLength(1);
    expect(doubleValidationStrategy.validate(NaN, "a")).toHaveLength(1);
    expect(doubleValidationStrategy.validate(Infinity, "a")).toHaveLength(1);
    expect(doubleValidationStrategy.validate(-Infinity, "a")).toHaveLength(1);
  });
});
