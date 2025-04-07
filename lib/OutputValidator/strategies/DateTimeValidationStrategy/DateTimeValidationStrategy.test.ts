import { expect, test, describe } from "vitest";
import { DateTimeValidationStrategy } from "./DateTimeValidationStrategy";

describe("DateTimeValidationStrategy", () => {
  test("Целое число, null и date iso являются валидными значениями", () => {
    const dateTimeValidationStrategy = new DateTimeValidationStrategy();

    expect(dateTimeValidationStrategy.validate(null, "a").length).toEqual(0);
    expect(dateTimeValidationStrategy.validate(423423423422, "a").length).toEqual(0);
    expect(dateTimeValidationStrategy.validate("2025-04-07T11:21:29.805Z", "a").length).toEqual(0);
    expect(dateTimeValidationStrategy.validate("2024-01-09T09:12:29.805Z", "a").length).toEqual(0);
    expect(dateTimeValidationStrategy.validate(0, "a").length).toEqual(0);

    expect(dateTimeValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(dateTimeValidationStrategy.validate(25.3234, "a").length).toEqual(1);
    expect(dateTimeValidationStrategy.validate("25.3234", "a").length).toEqual(1);
    expect(dateTimeValidationStrategy.validate("25erwe", "a").length).toEqual(1);
    expect(dateTimeValidationStrategy.validate("25.5665qqq", "a").length).toEqual(1);
    expect(dateTimeValidationStrategy.validate(NaN, "a").length).toEqual(1);
    expect(dateTimeValidationStrategy.validate(Infinity, "a").length).toEqual(1);
    expect(dateTimeValidationStrategy.validate(-Infinity, "a").length).toEqual(1);
  });
});
