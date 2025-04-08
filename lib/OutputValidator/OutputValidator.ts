import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import type { ValidationStrategy } from "./ValidationStrategy";
import { StringValidationStrategy } from "./strategies/StringValidationStrategy/StringValidationStrategy";
import { LongValidationStrategy } from "./strategies/LongValidationStrategy/LongValidationStrategy";
import { ArrayValidationStrategy } from "./strategies/ArrayValidationStrategy/ArrayValidationStrategy";
import { DoubleValidationStrategy } from "./strategies/DoubleValidationStrategy/DoubleValidationStrategy";
import { BooleanValidationStrategy } from "./strategies/BooleanValidationStrategy/BooleanValidationStrategy";
import { DateTimeValidationStrategy } from "./strategies/DateTimeValidationStrategy/DateTimeValidationStrategy";
import { BigIntegerValidationStrategy } from "./strategies/BigIntegerValidationStrategy/BigIntegerValidationStrategy";
import { FileValidationStrategy } from "./strategies/FileValidationStrategy/FileValidationStrategy";
import { ObjectValidationStrategy } from "./strategies/ObjectValidationStrategy/ObjectValidationStrategy";
import { BigDecimalValidationStrategy } from "./strategies/BigDecimalValidationStrategy/BigDecimalValidationStrategy";

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

  public validateOutput(output: any[], outputVariables: OutputBlockVariables[]): true | string[] {
    const errors = this.validateOutputInternal(output, "output", outputVariables);
    return errors.length === 0 ? true : errors;
  }

  /**
   * Рекурсивный метод валидации.
   * Итерирует по элементам данных и делегирует валидацию каждого поля
   * вспомогательному методу validateSingleVariable.
   *
   * @param items Массив элементов данных для валидации.
   * @param basePath Текущий путь для построения сообщений об ошибках.
   * @param variables Схема переменных, которым должны соответствовать элементы.
   * @returns Массив строк с ошибками валидации.
   */
  public validateOutputInternal(
    items: any[],
    basePath: string,
    variables: OutputBlockVariables[]
  ): string[] {
    const allErrors: string[] = [];

    const allowedVariableNames = new Set(variables.map((v) => v.name));

    for (const [itemIndex, item] of items.entries()) {
      const currentItemBasePath =
        items.length > 1 || basePath === "output" ? `${basePath}[${itemIndex}]` : basePath;

      // Проверка самого элемента (актуально для массивов объектов)
      if (item === null || item === undefined) {
        // Если схема не пуста, значит, мы ожидали здесь валидный элемент, а не null/undefined
        if (variables.length > 0) {
          allErrors.push(
            `${currentItemBasePath} равен null или undefined, но ожидается объект/элемент, основанный на схеме`
          );
        }

        continue;
      }

      for (const variable of variables) {
        const variableErrors = this.validateSingleVariable(item, currentItemBasePath, variable);

        allErrors.push(...variableErrors);
      }

      // Валидация элементов которых нет в схеме
      if (typeof item === "object" && item !== null) {
        const actualItemKeys = Object.keys(item);

        for (const key of actualItemKeys) {
          if (!allowedVariableNames.has(key)) {
            allErrors.push(`${currentItemBasePath} содержит неописанный ключ: '${key}'`);
          }
        }
      }
    }

    return allErrors;
  }

  /**
   * Валидирует одно поле (переменную) внутри одного элемента данных.
   * Выполняет проверки на undefined, null, находит и вызывает
   * соответствующую стратегию валидации типа.
   *
   * @param item Элемент данных, содержащий поле.
   * @param itemBasePath Базовый путь к элементу данных.
   * @param variable Описание переменной (имя, тип, структура) из схемы.
   * @returns Массив строк с ошибками для данного поля.
   */
  private validateSingleVariable(
    item: any,
    itemBasePath: string,
    variable: OutputBlockVariables
  ): string[] {
    const errors: string[] = [];
    const value = item[variable.name];
    const currentPath = `${itemBasePath}.${variable.name}`;

    // Проверка на undefined (ключ отсутствует) - всегда ошибка
    if (value === undefined) {
      errors.push(`${currentPath} не определен (undefined)`);

      return errors;
    }

    // Проверка на null - валидное значение, дальнейшие проверки не нужны
    if (value === null) {
      return errors;
    }

    // Получение стратегии для типа
    const strategy = this.strategies.get(variable.type);

    if (!strategy) {
      errors.push(`${currentPath} имеет неизвестный тип: ${variable.type}`);

      return errors;
    }

    // Делегирование валидации конкретного типа стратегии
    try {
      // Передаем 'this' (валидатор) для возможности рекурсии в стратегиях
      const validationErrors = strategy.validate(value, currentPath, variable, this);

      errors.push(...validationErrors);
    } catch (e) {
      errors.push(
        `${currentPath} вызвал непредвиденную ошибку проверки: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    return errors;
  }
}
