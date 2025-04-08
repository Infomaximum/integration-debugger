import { expect, test, describe } from "vitest";
import { ObjectValidationStrategy } from "./ObjectValidationStrategy";
import { OutputValidator } from "lib/OutputValidator/OutputValidator";
import type { OutputBlockVariables } from "@infomaximum/integration-sdk";

describe("ObjectValidationStrategy", () => {
  test("Валидация объекта", () => {
    const objectValidationStrategy = new ObjectValidationStrategy();
    const outputValidator = new OutputValidator();

    const testOutput = {
      v: {
        c: "56",
      },
    };

    const testOutputVariables = {
      name: "v",
      type: "Object",
      struct: [
        {
          name: "c",
          type: "Long",
        },
      ],
    } satisfies OutputBlockVariables;

    expect(
      objectValidationStrategy.validate(testOutput.v, "v", testOutputVariables, outputValidator)
        .length
    ).toEqual(0);
  });

  test("Валидация лишних ключей", () => {
    const objectValidationStrategy = new ObjectValidationStrategy();
    const outputValidator = new OutputValidator();

    const testOutput = {
      v: {
        c: "56",
        d: 55,
        hh: 42,
      },
    };

    const testOutputVariables = {
      name: "v",
      type: "Object",
      struct: [
        {
          name: "c",
          type: "Long",
        },
      ],
    } satisfies OutputBlockVariables;

    expect(
      objectValidationStrategy.validate(testOutput.v, "v", testOutputVariables, outputValidator)
        .length
    ).toEqual(2);
  });

  test("Валидация объекта с большой вложенностью", () => {
    const objectValidationStrategy = new ObjectValidationStrategy();
    const outputValidator = new OutputValidator();

    const testOutput = {
      v: {
        c: "56",
        b: {
          a: {
            n: {
              o: {
                p: 10,
              },
            },
          },
        },
      },
    };

    const schemaForTestOutput = {
      name: "v",
      type: "Object",
      struct: [
        {
          name: "c",
          type: "Long",
        },
        {
          name: "b",
          type: "Object",
          struct: [
            {
              name: "a",
              type: "Object",
              struct: [
                {
                  name: "n",
                  type: "Object",
                  struct: [
                    {
                      name: "o",
                      type: "Object",
                      struct: [
                        {
                          name: "p",
                          type: "Long",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } satisfies OutputBlockVariables;

    expect(
      objectValidationStrategy.validate(testOutput.v, "v", schemaForTestOutput, outputValidator)
        .length
    ).toEqual(0);
  });
});
