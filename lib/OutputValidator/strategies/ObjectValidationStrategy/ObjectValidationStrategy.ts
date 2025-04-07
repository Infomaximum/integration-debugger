import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { OutputValidator } from "lib/OutputValidator/OutputValidator";
import type { ValidationStrategy } from "lib/OutputValidator/ValidationStrategy";

export class ObjectValidationStrategy implements ValidationStrategy {
  validate(
    value: any,
    path: string,
    variable: OutputBlockVariables,
    validator: OutputValidator
  ): string[] {
    if (value === null) {
      return [];
    }

    if (!("struct" in variable)) {
      return [`${path} имеет тип "Object", но отсутствует поле 'struct'`];
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return validator.validateOutputInternal([value], path, variable.struct);
    }

    return [`${path} невалидное значение "${JSON.stringify(value)}", ожидался Object`];
  }
}
