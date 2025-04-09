import { expect, test, describe } from "vitest";
import { FileValidationStrategy } from "./FileValidationStrategy";

describe("FileValidationStrategy", () => {
  test("Строка является валидным значением", () => {
    const fileValidationStrategy = new FileValidationStrategy();

    expect(fileValidationStrategy.validate("qwe", "a")).toHaveLength(0);

    expect(fileValidationStrategy.validate(undefined, "a")).toHaveLength(1);
    expect(fileValidationStrategy.validate(3, "a")).toHaveLength(1);
    expect(fileValidationStrategy.validate(null, "a")).toHaveLength(1);
  });
});
