import { describe, expect, test } from "vitest";
import { BooleanInferenceStrategy } from "./BooleanInferenceStrategy";

describe("BooleanInferenceStrategy", () => {
  test("Генерация валидного типы из входного значения типа boolean", () => {
    const numberInferenceStrategy = new BooleanInferenceStrategy();

    expect(numberInferenceStrategy.infer(true)).toStrictEqual({ type: "Boolean" });
    expect(numberInferenceStrategy.infer(false)).toStrictEqual({ type: "Boolean" });

    expect(numberInferenceStrategy.infer(12)).toBeNull();
  });
});
