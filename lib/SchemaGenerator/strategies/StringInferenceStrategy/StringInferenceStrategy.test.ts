import { describe, expect, test } from "vitest";
import { StringInferenceStrategy } from "./StringInferenceStrategy";

describe("StringInferenceStrategy", () => {
  test("Генерация валидного типы из входного значения типа string", () => {
    const stringInferenceStrategy = new StringInferenceStrategy();

    expect(stringInferenceStrategy.infer("qwe")).toStrictEqual({ type: "String" });
    expect(stringInferenceStrategy.infer(new Date().toISOString())).toStrictEqual({
      type: "DateTime",
    });
    expect(stringInferenceStrategy.infer("24242424242424242424242424242423")).toStrictEqual({
      type: "BigInteger",
    });
    expect(stringInferenceStrategy.infer("-24242424242424242424242424242423")).toStrictEqual({
      type: "BigInteger",
    });
    expect(stringInferenceStrategy.infer("24242424242424.242424242424242423")).toStrictEqual({
      type: "BigDecimal",
    });
    expect(stringInferenceStrategy.infer("-24242424242424.242424242424242423")).toStrictEqual({
      type: "BigDecimal",
    });

    expect(stringInferenceStrategy.infer("4b794b59-bff8-4013-b656-5d34c33f4ce3")).toStrictEqual({
      type: "File",
    });

    expect(stringInferenceStrategy.infer(42)).toBeNull();
  });
});
