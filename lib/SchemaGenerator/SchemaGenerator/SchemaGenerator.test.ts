import { describe, expect, test, vi } from "vitest";
import { SchemaGenerator } from "./SchemaGenerator";
import type { OutputBlockVariables } from "@infomaximum/integration-sdk";

const fakeData = [
  [
    {
      id: 1001,
      record_type: "user_profile",
      is_active: true,
      created_at: new Date().toISOString(),
      tags: ["premium", "alpha", "beta"],

      profile_data: {
        full_name: "Alice Wonderland",
        age: 30,
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
        preferences: {
          theme: "dark",
          notifications: ["email", "push"],
          score_threshold: 95.5,
          send_summary: null,
        },
        last_coordinates: [40.7128, -74.006, 10.5],
      },

      transaction_ids: [12345, 67890, 98765],
      event_timestamps: [new Date(Date.now() - 100000).toISOString(), new Date().toISOString()],

      large_number_str: "98765432109876543232324234324234234234242310",
      precise_value_str: "12345.67890123456789",

      metadata: {
        source: "webform",
        correlation_id: "uuid-123-abc-xyz-789",
        processing_flags: [true, false, true, true],
        nested_array: [
          {
            history: ["event1", "event2"],
            timestamp: new Date(Date.now() - 50000).toISOString(),
          },
          { history: ["event3"], timestamp: new Date().toISOString() },
        ],
      },

      optional_notes: "Initial record created.",
      maybe_null_object: {
        config_value: 123.45,
      },
    },
  ],
];

const schema: OutputBlockVariables[] = [
  {
    name: "element_0",
    type: "Object",
    struct: [
      {
        name: "id",
        type: "Long",
      },
      {
        name: "record_type",
        type: "String",
      },
      {
        name: "is_active",
        type: "Boolean",
      },
      {
        name: "created_at",
        type: "DateTime",
      },
      {
        name: "tags",
        type: "StringArray",
      },
      {
        name: "profile_data",
        type: "Object",
        struct: [
          {
            name: "full_name",
            type: "String",
          },
          {
            name: "age",
            type: "Long",
          },
          {
            name: "contact_methods",
            type: "ObjectArray",
            struct: [
              {
                name: "type",
                type: "String",
              },
              {
                name: "value",
                type: "String",
              },
              {
                name: "verified",
                type: "Boolean",
              },
              {
                name: "attempts",
                type: "Long",
              },
            ],
          },
          {
            name: "preferences",
            type: "Object",
            struct: [
              {
                name: "theme",
                type: "String",
              },
              {
                name: "notifications",
                type: "StringArray",
              },
              {
                name: "score_threshold",
                type: "Double",
              },
              {
                name: "send_summary",
                //@ts-expect-error
                type: "NULL",
              },
            ],
          },
          {
            name: "last_coordinates",
            type: "DoubleArray",
          },
        ],
      },
      {
        name: "transaction_ids",
        type: "LongArray",
      },
      {
        name: "event_timestamps",
        type: "DateTimeArray",
      },
      {
        name: "large_number_str",
        type: "BigInteger",
      },
      {
        name: "precise_value_str",
        type: "BigDecimal",
      },
      {
        name: "metadata",
        type: "Object",
        struct: [
          {
            name: "source",
            type: "String",
          },
          {
            name: "correlation_id",
            type: "String",
          },
          {
            name: "processing_flags",
            type: "BooleanArray",
          },
          {
            name: "nested_array",
            type: "ObjectArray",
            struct: [
              {
                name: "history",
                type: "StringArray",
              },
              {
                name: "timestamp",
                type: "DateTime",
              },
            ],
          },
        ],
      },
      {
        name: "optional_notes",
        type: "String",
      },
      {
        name: "maybe_null_object",
        type: "Object",
        struct: [
          {
            name: "config_value",
            type: "Double",
          },
        ],
      },
    ],
  },
];

describe("SchemaGenerator", () => {
  (["log", "warn", "error"] as const).forEach((methodName) => {
    vi.spyOn(console, methodName).mockImplementation(() => undefined);
  });

  test("Генерация валидной схемы для большой структуры", () => {
    const schemaGenerator = new SchemaGenerator();

    expect(schemaGenerator.generate(fakeData)).toStrictEqual(schema);
  });

  test("Пустой массив для невалидных входных данных", () => {
    const schemaGenerator = new SchemaGenerator();

    expect(schemaGenerator.generate([])).toStrictEqual([]);
    //@ts-expect-error
    expect(schemaGenerator.generate(1)).toStrictEqual([]);
  });

  test("undefined выбрасывает ошибку", () => {
    const schemaGenerator = new SchemaGenerator();

    expect(schemaGenerator.generate([[1, null]])).toStrictEqual([
      {
        name: "element_0",
        type: "Long",
      },
      {
        name: "element_1",
        type: "NULL",
      },
    ]);
  });
});
