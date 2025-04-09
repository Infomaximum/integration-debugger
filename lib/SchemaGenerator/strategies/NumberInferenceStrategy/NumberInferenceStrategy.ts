import type { InferenceStrategy, ReturnInferStruct } from "lib/SchemaGenerator/InferenceStrategy";

export class NumberInferenceStrategy implements InferenceStrategy {
  infer(value: any): ReturnInferStruct | null {
    if (typeof value !== "number") {
      return null;
    }

    return { type: Number.isInteger(value) ? "Long" : "Double" };
  }
}
