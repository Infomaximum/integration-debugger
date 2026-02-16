import { isConvertedNumberToString } from "../../utils";
import type { ValidationStrategy } from "../../ValidationStrategy";

export class LongValidationStrategy implements ValidationStrategy {
  validate(value: any, path: string): string[] {
    if (value === null || isConvertedNumberToString(value)) {
      return [];
    }

    return [
      `${path} невалидное значение "${JSON.stringify(value)}", ожидалось значение, которое можно привести к типу Long (null, number, string)`,
    ];
  }
}
