import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { OutputValidator } from "./OutputValidator/OutputValidator";

export interface ValidationStrategy {
  validate(
    value: any,
    path: string,
    variable: OutputBlockVariables,
    validator: OutputValidator
  ): string[];
}
