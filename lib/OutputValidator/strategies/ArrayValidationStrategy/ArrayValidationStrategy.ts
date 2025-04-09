import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { OutputValidator } from "lib/OutputValidator/OutputValidator/OutputValidator";
import type { ValidationStrategy } from "lib/OutputValidator/ValidationStrategy";

type VariableType = OutputBlockVariables["type"];

export class ArrayValidationStrategy implements ValidationStrategy {
  constructor(
    private elementStrategy: ValidationStrategy,
    private elementType: VariableType
  ) {}

  validate(
    value: any,
    path: string,
    variable: OutputBlockVariables,
    validator: OutputValidator
  ): string[] {
    if (!Array.isArray(value)) {
      return [
        `${path} некорректное значение "${JSON.stringify(value)}", должен быть массив типа ${this.elementType}[]`,
      ];
    }

    const errors: string[] = [];

    for (const [index, element] of value.entries()) {
      const elementPath = `${path}[${index}]`;

      const elementVariable = {
        name: `${variable.name}_element_${index}`,
        type: this.elementType,
        // @ts-expect-error
        struct: variable.struct,
      } satisfies OutputBlockVariables;

      const elementErrors = this.elementStrategy.validate(
        element,
        elementPath,
        elementVariable,
        validator
      );

      errors.push(...elementErrors);
    }

    return errors;
  }
}
