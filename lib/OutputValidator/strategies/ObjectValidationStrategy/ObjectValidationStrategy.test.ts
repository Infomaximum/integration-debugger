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
      objectValidationStrategy.validate(testOutput, "a", testOutputVariables, outputValidator)
    ).toEqual(0);
  });
});
