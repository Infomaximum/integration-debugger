import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { ValidationStrategy } from "../ValidationStrategy";
import type { OutputValidator } from "../OutputValidator";

type VariableType = OutputBlockVariables["type"];

export class ArrayValidationStrategy implements ValidationStrategy {
  constructor(
    private elementStrategy: ValidationStrategy,
    private elementTypeName: string
  ) {}

  validate(
    value: any,
    path: string,
    variable: OutputBlockVariables,
    validator: OutputValidator
  ): string[] {
    if (!Array.isArray(value)) {
      return [`${path} should be an array of ${this.elementTypeName}s`];
    }

    const errors: string[] = [];
    value.forEach((element, index) => {
      const elementPath = `${path}[${index}]`;

      const elementVariable = {
        ...variable,
        name: `${variable.name}[${index}]`,
        type: variable.type.replace("Array", "") as VariableType, // Получаем тип элемента
        struct: "struct" in variable ? variable.struct : [],
      };

      const elementErrors = this.elementStrategy.validate(
        element,
        elementPath,
        elementVariable as OutputBlockVariables,
        validator
      );

      errors.push(...elementErrors);
    });

    return errors;
  }
}
