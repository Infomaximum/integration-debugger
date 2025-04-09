import type { InferenceStrategy, ReturnInferStruct } from "lib/SchemaGenerator/InferenceStrategy";

export class BooleanInferenceStrategy implements InferenceStrategy {
  infer(value: any): ReturnInferStruct | null {
    if (typeof value === "boolean") {
      return { type: "Boolean" };
    }

    return null;
  }
}
