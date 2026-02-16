import { Logger } from "../../../Logger";
import type { InferenceStrategy, ReturnInferStruct } from "../../InferenceStrategy";

export class FallbackInferenceStrategy implements InferenceStrategy {
  // Эта стратегия применяется последней, если ни одна другая не подошла
  infer(value: any): ReturnInferStruct | null {
    const jsType = typeof value;

    Logger.warn(
      `Не удалось определить специфический тип для значения (JS тип: ${jsType}). Используется тип по умолчанию: String.`
    );

    return { type: "String" };
  }
}
