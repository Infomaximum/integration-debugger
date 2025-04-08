import { expect, test, describe } from "vitest";
import { ArrayValidationStrategy } from "./ArrayValidationStrategy";
import { OutputValidator } from "lib/OutputValidator/OutputValidator";
import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import { StringValidationStrategy } from "../StringValidationStrategy/StringValidationStrategy";
import { ObjectValidationStrategy } from "../ObjectValidationStrategy/ObjectValidationStrategy";

describe("ArrayValidationStrategy", () => {
  const outputValidator = new OutputValidator();

  test("Валидация масива строк", () => {
    const stringStrategy = new StringValidationStrategy();
    const arrayValidationStrategy = new ArrayValidationStrategy(stringStrategy, "String");

    const testOutput = {
      c: ["a", "b"],
    };

    const testOutputVariables = {
      name: "c",
      type: "StringArray",
    } satisfies OutputBlockVariables;

    expect(
      arrayValidationStrategy.validate(testOutput.c, "c", testOutputVariables, outputValidator)
        .length
    ).toEqual(0);
  });

  test("Валидация масива объектов", () => {
    const objectStrategy = new ObjectValidationStrategy();
    const arrayValidationStrategy = new ArrayValidationStrategy(objectStrategy, "Object");

    const testOutput = {
      c: [
        {
          a: {
            a1: "a1",
          },
        },
        {
          b: {
            b1: "b1",
          },
        },
      ],
    };

    const testOutputVariables = {
      name: "c",
      type: "ObjectArray",
      struct: [
        {
          name: "a",
          type: "Object",
          struct: [
            {
              name: "a",
              type: "String",
            },
          ],
        },
        {
          name: "b",
          type: "Object",
          struct: [
            {
              name: "b",
              type: "String",
            },
          ],
        },
      ],
    } satisfies OutputBlockVariables;

    expect(
      arrayValidationStrategy.validate(testOutput.c, "c", testOutputVariables, outputValidator)
    ).toEqual(0);
  });
});
