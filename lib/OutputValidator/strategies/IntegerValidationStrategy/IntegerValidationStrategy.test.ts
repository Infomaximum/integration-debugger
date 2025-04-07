import { expect, test, describe } from "vitest";
import { IntegerValidationStrategy } from "./IntegerValidationStrategy";

describe("IntegerValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const integerValidationStrategy = new IntegerValidationStrategy();

    expect(integerValidationStrategy.validate(null, "a").length).toEqual(0);
    expect(integerValidationStrategy.validate(42, "a").length).toEqual(0);
    expect(integerValidationStrategy.validate("24", "a").length).toEqual(0);
    expect(integerValidationStrategy.validate(25.3234, "a").length).toEqual(0);
    expect(integerValidationStrategy.validate("25.3234", "a").length).toEqual(0);
    expect(integerValidationStrategy.validate(0, "a").length).toEqual(0);

    expect(integerValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(integerValidationStrategy.validate("25erwe", "a").length).toEqual(1);
    expect(integerValidationStrategy.validate("25.5665qqq", "a").length).toEqual(1);
    expect(integerValidationStrategy.validate(NaN, "a").length).toEqual(1);
    expect(integerValidationStrategy.validate(Infinity, "a").length).toEqual(1);
  });
});
