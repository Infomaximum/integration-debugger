import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { SchemaGenerator } from "./SchemaGenerator/SchemaGenerator";

export type VariableType = OutputBlockVariables["type"];

export type ReturnInferStruct = {
  type: VariableType;
  struct?: OutputBlockVariables[];
};

export interface InferenceStrategy {
  infer(value: any, generator: SchemaGenerator): ReturnInferStruct | null;
}
