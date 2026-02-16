import { expect, test, describe } from "vitest";
import { ArrayValidationStrategy } from "./ArrayValidationStrategy";
import { OutputValidator } from "../../OutputValidator/OutputValidator";
import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import { StringValidationStrategy } from "../StringValidationStrategy/StringValidationStrategy";
import { ObjectValidationStrategy } from "../ObjectValidationStrategy/ObjectValidationStrategy";

describe("ArrayValidationStrategy", () => {
  const outputValidator = new OutputValidator();

  test("Валидация массива строк", () => {
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

  test("Валидация массива объектов", () => {
    const objectStrategy = new ObjectValidationStrategy();
    const arrayValidationStrategy = new ArrayValidationStrategy(objectStrategy, "Object");

    const testOutput = {
      contact_methods: [
        {
          type: "email",
          value: "alice@example.com",
          verified: true,
          attempts: 5234243242424424,
        },
        {
          type: "phone",
          value: "+1234567890",
          verified: false,
          attempts: 4234242424242424,
        },
      ],
    };

    const testOutputVariables = {
      name: "contact_methods",
      type: "ObjectArray",
      struct: [
        { name: "type", type: "String" },
        { name: "value", type: "String" },
        { name: "verified", type: "Boolean" },
        { name: "attempts", type: "BigInteger" },
      ],
    } satisfies OutputBlockVariables;

    expect(
      arrayValidationStrategy.validate(
        testOutput.contact_methods,
        "contact_methods",
        testOutputVariables,
        outputValidator
      )
    ).toEqual([]);
  });

  test("Валидация массива объектов c null не является валидным", () => {
    const objectStrategy = new ObjectValidationStrategy();
    const arrayValidationStrategy = new ArrayValidationStrategy(objectStrategy, "Object");

    const testOutput = {
      contact_methods: [
        {
          type: "email",
          value: "alice@example.com",
          verified: true,
          attempts: 5234243242424424,
        },
        {
          type: "phone",
          value: "+1234567890",
          verified: false,
          attempts: 4234242424242424,
        },
        null,
      ],
    };

    const testOutputVariables = {
      name: "contact_methods",
      type: "ObjectArray",
      struct: [
        { name: "type", type: "String" },
        { name: "value", type: "String" },
        { name: "verified", type: "Boolean" },
        { name: "attempts", type: "BigInteger" },
      ],
    } satisfies OutputBlockVariables;

    expect(
      arrayValidationStrategy.validate(
        testOutput.contact_methods,
        "contact_methods",
        testOutputVariables,
        outputValidator
      )
    ).toHaveLength(1);
  });
});
