import { isConvertedNumberToString } from "lib/OutputValidator/utils";
import type { ValidationStrategy } from "lib/OutputValidator/ValidationStrategy";

export class DoubleValidationStrategy implements ValidationStrategy {
  validate(value: any, path: string): string[] {
    if (value === null || isConvertedNumberToString(value)) {
      return [];
    }

    return [
      `${path} невалидное значение "${JSON.stringify(value)}", ожидалось значение, которое можно привести к типу Double (null, number, string)`,
    ];
  }
}
