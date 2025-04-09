import type { InferenceStrategy, ReturnInferStruct } from "lib/SchemaGenerator/InferenceStrategy";

export class StringInferenceStrategy implements InferenceStrategy {
  infer(value: any): ReturnInferStruct | null {
    if (typeof value !== "string") {
      return null;
    }

    // для DateTime ISO строки
    if (
      value.length > 10 &&
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) &&
      !isNaN(Date.parse(value))
    ) {
      return { type: "DateTime" };
    }

    // для строк BigInteger (только цифры, возможно минус, длинная строка)
    if (/^-?\d+$/.test(value) && value.length > 18) {
      return { type: "BigInteger" };
    }

    // для строк BigDecimal (цифры, точка, возможно минус, длинная строка)
    if (/^-?\d+\.\d+$/.test(value) && value.length > 18) {
      return { type: "BigDecimal" };
    }

    // для файлов в uuid v4
    if (
      new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i).test(
        value
      )
    ) {
      return { type: "File" };
    }

    return { type: "String" };
  }
}
