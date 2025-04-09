import { afterAll, describe, expect, test, vi } from "vitest";
import { ObjectInferenceStrategy } from "./ObjectInferenceStrategy";
import { SchemaGenerator } from "lib/SchemaGenerator/SchemaGenerator/SchemaGenerator";

describe("ObjectInferenceStrategy", () => {
  const consoleLogMock = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const consoleWarnMock = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  afterAll(() => {
    consoleLogMock.mockReset();
    consoleWarnMock.mockReset();
  });

  test("Генерация валидного типы из входного значения типа object", () => {
    const schemaGenerator = new SchemaGenerator();

    const objectInferenceStrategy = new ObjectInferenceStrategy(schemaGenerator);

    expect(
      objectInferenceStrategy.infer({
        a: "qwe",
        b: 3,
        c: null,
      })
    ).toStrictEqual({
      type: "Object",
      struct: [
        {
          name: "a",
          type: "String",
        },
        {
          name: "b",
          type: "Long",
        },
        // не может определить null
        {
          name: "c",
          type: "NULL",
        },
      ],
    });
  });

  test("для значения null генерируется невалидный тип NULL", () => {
    const schemaGenerator = new SchemaGenerator();

    const objectInferenceStrategy = new ObjectInferenceStrategy(schemaGenerator);

    expect(
      objectInferenceStrategy.infer({
        c: null,
      })
    ).toStrictEqual({
      type: "Object",
      struct: [
        {
          name: "c",
          type: "NULL",
        },
      ],
    });
  });

  test("undefined выкидывает ошибку", () => {
    const schemaGenerator = new SchemaGenerator();

    const objectInferenceStrategy = new ObjectInferenceStrategy(schemaGenerator);

    expect(() =>
      objectInferenceStrategy.infer({
        a: undefined,
        b: 3,
        c: null,
      })
    ).toThrowError();
  });

  test("если не объект то возвращает null", () => {
    const schemaGenerator = new SchemaGenerator();

    const objectInferenceStrategy = new ObjectInferenceStrategy(schemaGenerator);

    expect(objectInferenceStrategy.infer(1)).toBeNull();
    expect(objectInferenceStrategy.infer("q")).toBeNull();
    expect(objectInferenceStrategy.infer([])).toBeNull();
    expect(objectInferenceStrategy.infer(null)).toBeNull();
    expect(objectInferenceStrategy.infer(undefined)).toBeNull();
  });
});
