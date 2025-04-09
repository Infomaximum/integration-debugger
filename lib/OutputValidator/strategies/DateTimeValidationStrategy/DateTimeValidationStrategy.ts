import { isFiniteNumber } from "lib/OutputValidator/utils";
import type { ValidationStrategy } from "lib/OutputValidator/ValidationStrategy";

export class DateTimeValidationStrategy implements ValidationStrategy {
  validate(value: any, path: string): string[] {
    if (value === null) {
      return [];
    }

    if (typeof value === "string" && !isNaN(Date.parse(value))) {
      return [];
    }

    if (isFiniteNumber(value) && Number.isInteger(value)) {
      return [];
    }

    return [
      `${path} невалидное значение "${JSON.stringify(value)}", ожидалось значение, которое можно привести к типу Date (null, целочисленное число, date iso)`,
    ];
  }
}
