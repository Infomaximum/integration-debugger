import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { InferenceStrategy, ReturnInferStruct } from "lib/SchemaGenerator/InferenceStrategy";
import type { SchemaGenerator } from "lib/SchemaGenerator/SchemaGenerator/SchemaGenerator";

export class ObjectInferenceStrategy implements InferenceStrategy {
  constructor(private generator: SchemaGenerator) {}

  private generateSchemaForObject(obj: object): OutputBlockVariables[] {
    const schema: OutputBlockVariables[] = [];

    for (const key of Object.keys(obj)) {
      const value = (obj as any)[key];

      if (value === undefined) {
        throw new Error(
          `"${key}" невалидное значение "undefined", необходимо исправить выходные значения`
        );
      }

      if (value === null) {
        console.warn(
          `Генерация схемы: по ключу "${key}" значение равное "null", невозможно определить точный тип, добавлен тип NUll `
        );

        schema.push({
          name: key,
          //@ts-expect-error
          type: "NULL",
        });

        continue;
      }

      const inferred = this.generator.inferTypeAndStruct(value);

      if (inferred) {
        //@ts-expect-error
        schema.push({
          name: key,
          type: inferred.type,
          ...(inferred.struct && { struct: inferred.struct }),
        });
      } else {
        console.error(`Не удалось определить тип для ключа "${key}".`);
      }
    }

    return schema;
  }

  infer(value: any): ReturnInferStruct | null {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const struct = this.generateSchemaForObject(value);

      return { type: "Object", struct };
    }

    return null;
  }
}
