import { expect, test, describe } from "vitest";
import { FileValidationStrategy } from "./FileValidationStrategy";

describe("FileValidationStrategy", () => {
  test("Строка является валидным значением", () => {
    const fileValidationStrategy = new FileValidationStrategy();

    expect(fileValidationStrategy.validate("qwe", "a").length).toEqual(0);

    expect(fileValidationStrategy.validate(undefined, "a").length).toEqual(1);
    expect(fileValidationStrategy.validate(3, "a").length).toEqual(1);
    expect(fileValidationStrategy.validate(null, "a").length).toEqual(1);
  });
});
