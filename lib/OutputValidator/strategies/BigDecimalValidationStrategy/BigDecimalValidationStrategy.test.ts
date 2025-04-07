import { expect, test, describe } from "vitest";
import { BigDecimalValidationStrategy } from "./BigDecimalValidationStrategy";

describe("BigDecimalValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const bigDecimalValidationStrategy = new BigDecimalValidationStrategy();

    expect(bigDecimalValidationStrategy.validate(null, "a").length).toEqual(0);
    expect(bigDecimalValidationStrategy.validate(42, "a").length).toEqual(0);
    expect(bigDecimalValidationStrategy.validate("24", "a").length).toEqual(0);
    expect(bigDecimalValidationStrategy.validate(25.3234, "a").length).toEqual(0);
    expect(bigDecimalValidationStrategy.validate("25.3234", "a").length).toEqual(0);
    expect(bigDecimalValidationStrategy.validate(0, "a").length).toEqual(0);

    expect(bigDecimalValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(bigDecimalValidationStrategy.validate("25erwe", "a").length).toEqual(1);
    expect(bigDecimalValidationStrategy.validate("25.5665qqq", "a").length).toEqual(1);
    expect(bigDecimalValidationStrategy.validate(NaN, "a").length).toEqual(1);
    expect(bigDecimalValidationStrategy.validate(Infinity, "a").length).toEqual(1);
    expect(bigDecimalValidationStrategy.validate(-Infinity, "a").length).toEqual(1);
  });
});
