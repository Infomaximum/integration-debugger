import { expect, test, describe } from "vitest";
import { BooleanValidationStrategy } from "./BooleanValidationStrategy";

describe("BooleanValidationStrategy", () => {
  test("null и boolean являются валидными значениями", () => {
    const booleanValidationStrategy = new BooleanValidationStrategy();

    expect(booleanValidationStrategy.validate(null, "a")).toHaveLength(0);
    expect(booleanValidationStrategy.validate(true, "a")).toHaveLength(0);
    expect(booleanValidationStrategy.validate(false, "a")).toHaveLength(0);

    expect(booleanValidationStrategy.validate(undefined, "a")).toHaveLength(1);
    expect(booleanValidationStrategy.validate(42, "a")).toHaveLength(1);
    expect(booleanValidationStrategy.validate("test", "a")).toHaveLength(1);
  });
});
