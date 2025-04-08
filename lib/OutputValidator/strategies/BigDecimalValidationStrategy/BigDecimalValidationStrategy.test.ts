import { expect, test, describe } from "vitest";
import { BigDecimalValidationStrategy } from "./BigDecimalValidationStrategy";

describe("BigDecimalValidationStrategy", () => {
  test("Целое, дробное числа, null и число в строке являются валидными значениями", () => {
    const bigDecimalValidationStrategy = new BigDecimalValidationStrategy();

    expect(bigDecimalValidationStrategy.validate(null, "a")).toHaveLength(0);
    expect(bigDecimalValidationStrategy.validate(42, "a")).toHaveLength(0);
    expect(bigDecimalValidationStrategy.validate("24", "a")).toHaveLength(0);
    expect(bigDecimalValidationStrategy.validate(25.3234, "a")).toHaveLength(0);
    expect(bigDecimalValidationStrategy.validate("25.3234", "a")).toHaveLength(0);
    expect(bigDecimalValidationStrategy.validate(0, "a")).toHaveLength(0);

    expect(bigDecimalValidationStrategy.validate(undefined, "a")).toHaveLength(1);
    expect(bigDecimalValidationStrategy.validate("25erwe", "a")).toHaveLength(1);
    expect(bigDecimalValidationStrategy.validate("25.5665qqq", "a")).toHaveLength(1);
    expect(bigDecimalValidationStrategy.validate(NaN, "a")).toHaveLength(1);
    expect(bigDecimalValidationStrategy.validate(Infinity, "a")).toHaveLength(1);
    expect(bigDecimalValidationStrategy.validate(-Infinity, "a")).toHaveLength(1);
  });
});
