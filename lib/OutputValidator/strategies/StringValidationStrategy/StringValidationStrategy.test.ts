import { expect, test, describe } from "vitest";
import { StringValidationStrategy } from "./StringValidationStrategy";

describe("StringValidationStrategy", () => {
  test("Число, строка и null являются валидными значениями", () => {
    const stringValidationStrategy = new StringValidationStrategy();

    expect(stringValidationStrategy.validate("qwe", "a")).toHaveLength(0);
    expect(stringValidationStrategy.validate(3, "a")).toHaveLength(0);
    expect(stringValidationStrategy.validate(null, "a")).toHaveLength(0);

    expect(stringValidationStrategy.validate(undefined, "a")).toHaveLength(1);
    expect(stringValidationStrategy.validate({}, "a")).toHaveLength(1);
  });
});
