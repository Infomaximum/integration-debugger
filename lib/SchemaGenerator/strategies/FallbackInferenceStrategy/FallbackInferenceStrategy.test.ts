import { describe, expect, test } from "vitest";
import { FallbackInferenceStrategy } from "./FallbackInferenceStrategy";

describe("FallbackInferenceStrategy", () => {
  test("String тип по умолчанию", () => {
    const fallbackInferenceStrategy = new FallbackInferenceStrategy();

    expect(fallbackInferenceStrategy.infer(123)).toStrictEqual({ type: "String" });
    expect(fallbackInferenceStrategy.infer(true)).toStrictEqual({ type: "String" });
  });
});
