import { describe, expect, test } from "vitest";
import { ArrayInferenceStrategy } from "./ArrayInferenceStrategy";
import { SchemaGenerator } from "../../SchemaGenerator/SchemaGenerator";

describe("ArrayInferenceStrategy", () => {
  test("Генерация валидного типы из входного значения типа array", () => {
    const schemaGenerator = new SchemaGenerator();

    const arrayInferenceStrategy = new ArrayInferenceStrategy(schemaGenerator);

    expect(arrayInferenceStrategy.infer([1, 2])).toStrictEqual({ type: "LongArray" });
    expect(arrayInferenceStrategy.infer(["q", "w"])).toStrictEqual({ type: "StringArray" });
    expect(arrayInferenceStrategy.infer([1.1, 2.1])).toStrictEqual({ type: "DoubleArray" });
    expect(
      arrayInferenceStrategy.infer(["1111111111111111111111111111", "2222222222222222222222222222"])
    ).toStrictEqual({ type: "BigIntegerArray" });
    expect(
      arrayInferenceStrategy.infer([
        "1111111111.111111111111111111",
        "222222222.2222222222222222222",
      ])
    ).toStrictEqual({ type: "BigDecimalArray" });
    expect(arrayInferenceStrategy.infer([true, false])).toStrictEqual({ type: "BooleanArray" });
    expect(
      arrayInferenceStrategy.infer([new Date().toISOString(), new Date().toISOString()])
    ).toStrictEqual({ type: "DateTimeArray" });
  });
});
