import { describe, expect, test } from "vitest";
import { NumberInferenceStrategy } from "./NumberInferenceStrategy";

describe("NumberInferenceStrategy", () => {
  test("Генерация валидного типы из входного значения типа number", () => {
    const numberInferenceStrategy = new NumberInferenceStrategy();

    expect(numberInferenceStrategy.infer(123)).toStrictEqual({ type: "Long" });
    expect(numberInferenceStrategy.infer(123.4)).toStrictEqual({ type: "Double" });

    expect(numberInferenceStrategy.infer("3453535")).toBeNull();
  });
});
