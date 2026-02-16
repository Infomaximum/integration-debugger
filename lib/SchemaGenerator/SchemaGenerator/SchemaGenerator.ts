import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { InferenceStrategy, VariableType } from "../InferenceStrategy";
import { StringInferenceStrategy } from "../strategies/StringInferenceStrategy/StringInferenceStrategy";
import { ArrayInferenceStrategy } from "../strategies/ArrayInferenceStrategy/ArrayInferenceStrategy";
import { NumberInferenceStrategy } from "../strategies/NumberInferenceStrategy/NumberInferenceStrategy";
import { BooleanInferenceStrategy } from "../strategies/BooleanInferenceStrategy/BooleanInferenceStrategy";
import { ObjectInferenceStrategy } from "../strategies/ObjectInferenceStrategy/ObjectInferenceStrategy";
import { FallbackInferenceStrategy } from "../strategies/FallbackInferenceStrategy/FallbackInferenceStrategy";
import { Logger } from "../../Logger";

export class SchemaGenerator {
  private strategies: InferenceStrategy[] = [];

  constructor() {
    // Регистрируем стратегии в определенном порядке (от более специфичных к общим)
    this.strategies.push(new ArrayInferenceStrategy(this));
    this.strategies.push(new BooleanInferenceStrategy());
    this.strategies.push(new NumberInferenceStrategy());
    this.strategies.push(new StringInferenceStrategy());
    this.strategies.push(new ObjectInferenceStrategy(this));

    // должна регистрироваться последней
    this.strategies.push(new FallbackInferenceStrategy());
  }

  public inferTypeAndStruct(
    value: any
  ): { type: VariableType; struct?: OutputBlockVariables[] } | null {
    for (const strategy of this.strategies) {
      const result = strategy.infer(value, this);

      if (result !== null) {
        return result;
      }
    }

    Logger.error(`Тип не определен для значения: ${JSON.stringify(value)}`);

    return null;
  }

  private generateSchemaForArrayIndexMode(outputData: any[]): OutputBlockVariables[] {
    const generatedSchema: OutputBlockVariables[] = [];

    for (let i = 0; i < outputData.length; i++) {
      const value = outputData[i];
      const name = `element_${i}`;

      if (value === undefined) {
        throw new Error(
          `"${name}" невалидное значение "undefined", необходимо исправить выходные значения`
        );
      }

      if (value === null) {
        Logger.warn(
          `Генерация схемы: по ключу "${name}" значение равное "null", невозможно определить точный тип, добавлен тип NUll `
        );

        generatedSchema.push({
          name,
          //@ts-expect-error
          type: "NULL",
        });

        continue;
      }

      // Определяем тип элемента
      const inferred = this.inferTypeAndStruct(value);

      if (inferred) {
        //@ts-expect-error
        generatedSchema.push({
          name,
          type: inferred.type,
          ...(inferred.struct && { struct: inferred.struct }),
        });
      } else {
        Logger.error(`Не удалось определить тип для элемента с индексом ${i}.`);
      }
    }

    return generatedSchema;
  }

  public generate(outputData: any[][]): OutputBlockVariables[] {
    if (
      !Array.isArray(outputData) ||
      outputData.length === 0 ||
      !outputData.every((arr) => Array.isArray(arr))
    ) {
      Logger.error("Входные данные должны быть массивом массивов element[][]");

      return [];
    }

    const firstItem = outputData[0];

    return this.generateSchemaForArrayIndexMode(firstItem);
  }
}
