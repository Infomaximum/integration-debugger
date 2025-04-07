import { expect, test, describe } from "vitest";
import { StringValidationStrategy } from "./StringValidationStrategy";

describe("StringValidationStrategy", () => {
  test("Число, строка и null являются валидными значениями", () => {
    const stringValidationStrategy = new StringValidationStrategy();

    expect(stringValidationStrategy.validate("qwe", "a").length).toEqual(0);
    expect(stringValidationStrategy.validate(3, "a").length).toEqual(0);
    expect(stringValidationStrategy.validate(null, "a").length).toEqual(0);

    expect(stringValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(stringValidationStrategy.validate({}, "a").length).toEqual(1);
  });
});
