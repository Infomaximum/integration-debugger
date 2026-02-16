import { Logger } from "../../../Logger";
import type { InferenceStrategy, ReturnInferStruct, VariableType } from "../../InferenceStrategy";
import type { SchemaGenerator } from "../../SchemaGenerator/SchemaGenerator";

export class ArrayInferenceStrategy implements InferenceStrategy {
  constructor(private generator: SchemaGenerator) {}

  infer(value: any): ReturnInferStruct | null {
    if (!Array.isArray(value)) {
      return null;
    }

    if (value.length === 0) {
      // Невозможно определить тип элемента из пустого массива. Используем умолчание.
      // Можно сделать это поведение настраиваемым.
      Logger.warn("Обнаружен пустой массив, тип элементов по умолчанию: StringArray.");
      return { type: "StringArray" };
    }

    // Ищем первый не-null/не-undefined элемент для определения типа
    let firstValidElement = null;

    for (const element of value) {
      if (element !== null && element !== undefined) {
        firstValidElement = element;
        break;
      }
    }

    if (firstValidElement === null) {
      // Все элементы null или undefined. Используем умолчание.
      Logger.warn(
        "Массив содержит только null/undefined, тип элементов по умолчанию: StringArray."
      );

      return { type: "StringArray" };
    }

    const elementInference = this.generator.inferTypeAndStruct(firstValidElement);

    if (!elementInference) {
      Logger.warn(
        `Не удалось определить тип для элементов массива (первый элемент: ${firstValidElement}). По умолчанию: StringArray.`
      );

      return { type: "StringArray" };
    }

    const elementType = elementInference.type;

    const arrayType = `${elementType}Array` as VariableType;

    // Проверяем, является ли созданный тип массива допустимым
    const validArrayTypes: VariableType[] = [
      "StringArray",
      "LongArray",
      "DoubleArray",
      "BooleanArray",
      "BigIntegerArray",
      "BigDecimalArray",
      "DateTimeArray",
      "ObjectArray",
    ];

    if (!validArrayTypes.includes(arrayType)) {
      Logger.warn(
        `Не удалось сформировать стандартный тип массива для типа элемента "${elementType}". По умолчанию: StringArray.`
      );

      return { type: "StringArray" };
    }

    return { type: arrayType, ...(elementInference.struct && { struct: elementInference.struct }) };
  }
}
