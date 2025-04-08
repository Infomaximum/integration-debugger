import type { ValidationStrategy } from "../../ValidationStrategy";

export class StringValidationStrategy implements ValidationStrategy {
  validate(value: any, path: string): string[] {
    if (value === null || typeof value === "number" || typeof value === "string") {
      return [];
    }

    return [
      `${path} невалидное значение "${JSON.stringify(value)}", ожидался тип String (null, number, string)`,
    ];
  }
}
