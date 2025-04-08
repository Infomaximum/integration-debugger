import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { OutputValidator } from "lib/OutputValidator/OutputValidator/OutputValidator";
import type { ValidationStrategy } from "lib/OutputValidator/ValidationStrategy";

export class ObjectValidationStrategy implements ValidationStrategy {
  private validateBySchema(
    itemObject: any,
    itemBasePath: string,
    structSchema: OutputBlockVariables[],
    validator: OutputValidator
  ): string[] {
    const errors: string[] = [];

    if (typeof itemObject !== "object" || itemObject === null || Array.isArray(itemObject)) {
      errors.push(
        `${itemBasePath} должен быть объектом, но получен "${JSON.stringify(itemObject)}"`
      );

      return errors;
    }

    const allowedNames = new Set(structSchema.map((v) => v.name));

    // Валидация ожидаемых полей по имени
    for (const variable of structSchema) {
      const currentPath = `${itemBasePath}.${variable.name}`;
      const value = itemObject[variable.name];

      if (value === undefined) {
        errors.push(`${currentPath} отсутствует (undefined)`);

        continue;
      }

      if (value === null) {
        continue;
      }

      const strategy = validator.getStrategy(variable.type);

      if (!strategy) {
        errors.push(`${currentPath} имеет неизвестный тип: ${variable.type}`);
        continue;
      }
      try {
        const validationErrors = strategy.validate(value, currentPath, variable, validator);
        errors.push(...validationErrors);
      } catch (e) {
        errors.push(
          `${currentPath} вызвал непредвиденную ошибку: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }

    // Проверка на лишние ключи
    const actualKeys = Object.keys(itemObject);

    for (const key of actualKeys) {
      if (!allowedNames.has(key)) {
        errors.push(`${itemBasePath} содержит неописанный ключ: '${key}'`);
      }
    }

    return errors;
  }

  validate(
    value: any,
    path: string,
    variable: OutputBlockVariables,
    validator: OutputValidator
  ): string[] {
    if (!("struct" in variable)) {
      return [`${path} имеет тип "Object", но отсутствует поле 'struct'`];
    }

    // явная обработка null
    if ((typeof value === "object" || value === null) && !Array.isArray(value)) {
      return this.validateBySchema(value, path, variable.struct, validator);
    }

    return [`${path} невалидное значение "${JSON.stringify(value)}", ожидался Object`];
  }
}
