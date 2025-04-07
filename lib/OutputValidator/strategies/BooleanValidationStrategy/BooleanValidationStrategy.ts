import type { ValidationStrategy } from "lib/OutputValidator/ValidationStrategy";

export class BooleanValidationStrategy implements ValidationStrategy {
  validate(value: any, path: string): string[] {
    if (value === null || typeof value === "boolean") {
      return [];
    }

    return [`${path} невалидное значение "${value}", ожидался тип Boolean (null, boolean)`];
  }
}
