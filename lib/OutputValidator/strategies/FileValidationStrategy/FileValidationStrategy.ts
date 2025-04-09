import type { ValidationStrategy } from "lib/OutputValidator/ValidationStrategy";

export class FileValidationStrategy implements ValidationStrategy {
  validate(value: any, path: string): string[] {
    if (typeof value === "string") {
      return [];
    }

    return [`${path} невалидное значение "${JSON.stringify(value)}", ожидался File (string)`];
  }
}
