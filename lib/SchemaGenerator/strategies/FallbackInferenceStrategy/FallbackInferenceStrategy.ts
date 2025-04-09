import type { InferenceStrategy, ReturnInferStruct } from "lib/SchemaGenerator/InferenceStrategy";

export class FallbackInferenceStrategy implements InferenceStrategy {
  // Эта стратегия применяется последней, если ни одна другая не подошла
  infer(value: any): ReturnInferStruct | null {
    const jsType = typeof value;

    console.warn(
      `Не удалось определить специфический тип для значения (JS тип: ${jsType}). Используется тип по умолчанию: String.`
    );

    return { type: "String" };
  }
}
