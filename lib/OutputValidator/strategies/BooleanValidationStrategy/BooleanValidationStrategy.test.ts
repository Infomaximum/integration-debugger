import { expect, test, describe } from "vitest";
import { BooleanValidationStrategy } from "./BooleanValidationStrategy";

describe("BooleanValidationStrategy", () => {
  test("null и boolean являются валидными значениями", () => {
    const booleanValidationStrategy = new BooleanValidationStrategy();

    expect(booleanValidationStrategy.validate(null, "a").length).toEqual(0);
    expect(booleanValidationStrategy.validate(true, "a").length).toEqual(0);
    expect(booleanValidationStrategy.validate(false, "a").length).toEqual(0);

    expect(booleanValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(booleanValidationStrategy.validate(42, "a").length).toEqual(1);
    expect(booleanValidationStrategy.validate("test", "a").length).toEqual(1);
  });
});
