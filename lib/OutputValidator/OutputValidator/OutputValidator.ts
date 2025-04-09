import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { ValidationStrategy } from "../ValidationStrategy";
import { StringValidationStrategy } from "../strategies/StringValidationStrategy/StringValidationStrategy";
import { LongValidationStrategy } from "../strategies/LongValidationStrategy/LongValidationStrategy";
import { ArrayValidationStrategy } from "../strategies/ArrayValidationStrategy/ArrayValidationStrategy";
import { DoubleValidationStrategy } from "../strategies/DoubleValidationStrategy/DoubleValidationStrategy";
import { BooleanValidationStrategy } from "../strategies/BooleanValidationStrategy/BooleanValidationStrategy";
import { DateTimeValidationStrategy } from "../strategies/DateTimeValidationStrategy/DateTimeValidationStrategy";
import { BigIntegerValidationStrategy } from "../strategies/BigIntegerValidationStrategy/BigIntegerValidationStrategy";
import { FileValidationStrategy } from "../strategies/FileValidationStrategy/FileValidationStrategy";
import { ObjectValidationStrategy } from "../strategies/ObjectValidationStrategy/ObjectValidationStrategy";
import { BigDecimalValidationStrategy } from "../strategies/BigDecimalValidationStrategy/BigDecimalValidationStrategy";

type VariableType = OutputBlockVariables["type"];

export class OutputValidator {
  private strategies: Map<VariableType, ValidationStrategy>;

  constructor() {
    this.strategies = new Map<VariableType, ValidationStrategy>();

    this.registerDefaultStrategies();
  }

  private registerStrategy(type: VariableType, strategy: ValidationStrategy) {
    this.strategies.set(type, strategy);

    return this;
  }

  private registerDefaultStrategies(): void {
    const stringStrategy = new StringValidationStrategy();
    const longStrategy = new LongValidationStrategy();
    const doubleStrategy = new DoubleValidationStrategy();
    const booleanStrategy = new BooleanValidationStrategy();
    const dateTimeStrategy = new DateTimeValidationStrategy();
    const bigIntegerStrategy = new BigIntegerValidationStrategy();
    const bigDecimalStrategy = new BigDecimalValidationStrategy();
    const fileStrategy = new FileValidationStrategy();

    const objectStrategy = new ObjectValidationStrategy();

    this.registerStrategy("String", stringStrategy)
      .registerStrategy("Long", longStrategy)
      .registerStrategy("Double", doubleStrategy)
      .registerStrategy("Boolean", booleanStrategy)
      .registerStrategy("DateTime", dateTimeStrategy)
      .registerStrategy("BigInteger", bigIntegerStrategy)
      .registerStrategy("BigDecimal", bigDecimalStrategy)
      .registerStrategy("File", fileStrategy)
      .registerStrategy("Object", objectStrategy)
      .registerStrategy("StringArray", new ArrayValidationStrategy(stringStrategy, "String"))
      .registerStrategy("LongArray", new ArrayValidationStrategy(longStrategy, "Long"))
      .registerStrategy("DoubleArray", new ArrayValidationStrategy(doubleStrategy, "Double"))
      .registerStrategy("BooleanArray", new ArrayValidationStrategy(booleanStrategy, "Boolean"))
      .registerStrategy("DateTimeArray", new ArrayValidationStrategy(dateTimeStrategy, "DateTime"))
      .registerStrategy(
        "BigIntegerArray",
        new ArrayValidationStrategy(bigIntegerStrategy, "BigInteger")
      )
      .registerStrategy(
        "BigDecimalArray",
        new ArrayValidationStrategy(bigDecimalStrategy, "BigDecimal")
      )
      .registerStrategy("ObjectArray", new ArrayValidationStrategy(objectStrategy, "Object"));
  }

  public getStrategy(type: VariableType): ValidationStrategy | undefined {
    return this.strategies.get(type);
  }

  public validateOutput(output: any[], outputVariables: OutputBlockVariables[]): true | string[] {
    const errors = this.validateItemsInternal(output, "output", outputVariables);

    return errors.length === 0 ? true : errors;
  }

  private validateItemsInternal(
    items: any[],
    basePath: string,
    schema: OutputBlockVariables[]
  ): string[] {
    const allErrors: string[] = [];

    for (const [itemIndex, item] of items.entries()) {
      const currentItemBasePath = `${basePath}[${itemIndex}]`;

      const itemErrors = this.validateArrayItemByIndex(item, schema, currentItemBasePath);

      allErrors.push(...itemErrors);
    }

    return allErrors;
  }

  private validateArrayItemByIndex(
    itemArray: any,
    schema: OutputBlockVariables[],
    itemBasePath: string
  ): string[] {
    const errors: string[] = [];

    // Проверка, что сам элемент является массивом
    if (!Array.isArray(itemArray)) {
      errors.push(`${itemBasePath} должен быть массивом, но получен ${typeof itemArray}`);

      return errors;
    }

    //  Проверка длины массива данных и схемы
    const dataLength = itemArray.length;
    const schemaLength = schema.length;

    if (dataLength < schemaLength) {
      for (let i = dataLength; i < schemaLength; i++) {
        const schemaName = schema[i]?.name || `[${i}]`;

        errors.push(`${itemBasePath}[${i}] (поле '${schemaName}') отсутствует`);
      }
    }

    if (dataLength > schemaLength) {
      for (let i = schemaLength; i < dataLength; i++) {
        errors.push(`${itemBasePath}[${i}] имеет лишнее значение (не описано в схеме)`);
      }
    }

    // Валидация каждого элемента по соответствующему индексу в схеме
    const lengthToValidate = Math.min(dataLength, schemaLength);

    for (let i = 0; i < lengthToValidate; i++) {
      const value = itemArray[i];
      const variableSchema = schema[i];

      const currentPath = `${itemBasePath}[${i}]`;
      const descriptiveName = variableSchema.name ? ` (поле '${variableSchema.name}')` : "";

      if (value === null) {
        continue;
      }

      const strategy = this.getStrategy(variableSchema.type);

      if (!strategy) {
        errors.push(
          `${currentPath}${descriptiveName} имеет неизвестный тип: ${variableSchema.type}`
        );
        continue;
      }

      try {
        const validationErrors = strategy.validate(value, currentPath, variableSchema, this);

        if (validationErrors.length > 0 && descriptiveName) {
          errors.push(...validationErrors.map((e) => `${e}${descriptiveName}`));
        } else {
          errors.push(...validationErrors);
        }
      } catch (e) {
        errors.push(
          `${currentPath}${descriptiveName} вызвал непредвиденную ошибку проверки: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }

    return errors;
  }
}
