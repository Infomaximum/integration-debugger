# Integration Debugger

Библиотека для отладки и тестирования интеграций, построенных на базе [@infomaximum/integration-sdk](https://github.com/Infomaximum/integration-sdk).

## Возможности

- 🔍 Отладка блоков интеграций с мок-данными
- 🔌 Тестирование подключений к внешним сервисам
- 🔄 Серийное выполнение блоков (до 100,000 итераций)
- 📊 Поддержка контекста и пагинации между запусками
- 🛠️ Полная эмуляция ExecuteService для HTTP-запросов
- 🎯 Автоматическая генерация схемы выходных данных блока

## Установка

```bash
npm install @infomaximum/integration-debugger
```

или

```bash
yarn add @infomaximum/integration-debugger
```

## Требования

- Node.js >= 22
- @infomaximum/integration-sdk >= 3.4.1 (peer dependency)

## Использование

### Базовая отладка блока

```typescript
import { IntegrationExecutor } from "@infomaximum/integration-debugger";
import type { DebuggingConfig } from "@infomaximum/integration-debugger";
import myIntegration from "./my-integration";

const config: DebuggingConfig = {
  blocks: {
    "my-block-key": {
      inputData: {
        userId: "12345",
        action: "fetch",
      },
      authData: {
        apiKey: "test-api-key",
        apiSecret: "test-secret",
      },
    },
  },
};

const executor = new IntegrationExecutor(myIntegration, {
  entityKey: "my-block-key",
  debuggingConfig: config,
});

executor.execute();
```

### Отладка с использованием подключения

```typescript
const config: DebuggingConfig = {
  blocks: {
    "my-block-key": {
      inputData: { query: "test" },
      // Использовать authData из подключения
      connectionKey: "my-connection-key",
    },
  },
  connections: {
    "my-connection-key": {
      authData: {
        apiKey: "real-api-key",
        token: "bearer-token",
      },
    },
  },
};

const executor = new IntegrationExecutor(myIntegration, {
  entityKey: "my-block-key",
  debuggingConfig: config,
});

executor.execute();
```

### Серийное выполнение

Полезно для тестирования пагинации и обработки больших объемов данных:

```typescript
const config: DebuggingConfig = {
  seriesIterations: 10, // Выполнить 10 раз
  blocks: {
    "pagination-block": {
      inputData: { limit: 100 },
    },
  },
};

const executor = new IntegrationExecutor(myIntegration, {
  entityKey: "pagination-block",
  debuggingConfig: config,
  series: true, // Включить режим серии
});

executor.execute();
```

### Генерация схемы выходных данных

Автоматически генерирует схему `OutputBlockVariables[]` на основе выходных данных блока:

```typescript
const executor = new IntegrationExecutor(myIntegration, {
  entityKey: "my-block-key",
  debuggingConfig: config,
  isGenerateSchema: true, // Включить генерацию схемы
});

executor.execute();
// Схема будет выведена в консоль после первого выполнения
```

Или использовать функцию напрямую:

```typescript
import { generateSchemaFromOutputData } from "@infomaximum/integration-debugger";

const outputData = [
  { id: 1, name: "Test", active: true },
  { id: 2, name: "Demo", active: false },
];

const schema = generateSchemaFromOutputData(outputData);
console.log(schema);
// [
//   { key: "id", label: "id", type: "long" },
//   { key: "name", label: "name", type: "string" },
//   { key: "active", label: "active", type: "boolean" }
// ]
```

### Использование общих данных авторизации

Для передачи общих данных авторизации (например, `integrationId`, `userId`) используйте `commonAuthData`:

```typescript
const config: DebuggingConfig = {
  commonAuthData: {
    integrationId: "integration-123",
    userId: "user-456",
  },
  blocks: {
    "my-block-key": {
      inputData: { query: "test" },
      authData: {
        apiKey: "block-specific-key",
      },
    },
  },
};

// Итоговые authData для блока будут объединены:
// { apiKey: "block-specific-key", integrationId: "integration-123", userId: "user-456" }
```

### Отладка подключения

```typescript
const config: DebuggingConfig = {
  connections: {
    "oauth-connection": {
      authData: {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      },
    },
  },
};

const executor = new IntegrationExecutor(myIntegration, {
  entityKey: "oauth-connection",
  debuggingConfig: config,
});

executor.execute();
```

## API

### IntegrationExecutor

Основной класс для выполнения отладки интеграций.

#### Конструктор

```typescript
new IntegrationExecutor(
  integration: Integration,
  params: {
    entityKey: string;
    debuggingConfig: DebuggingConfig;
    series?: boolean;
    isGenerateSchema?: boolean;
  }
)
```

- `integration` - объект интеграции из integration-sdk
- `entityKey` - ключ блока или подключения для отладки
- `debuggingConfig` - конфигурация мок-данных
- `series` - режим серийного выполнения (по умолчанию `false`)
- `isGenerateSchema` - автоматическая генерация схемы выходных данных (по умолчанию `false`)

#### Методы

- `execute()` - запускает отладку указанной сущности

### DebuggingConfig

Конфигурация для отладки интеграций.

```typescript
type DebuggingConfig = {
  seriesIterations?: number; // 1-100,000, по умолчанию 3
  commonAuthData?: Record<string, any>; // Общие данные авторизации для всех блоков и подключений
  blocks: {
    [blockKey: string]: {
      inputData: Record<string, string | number>;
      authData?: Record<string, string | number>;
      connectionKey?: string;
    };
  };
  connections?: {
    [connectionKey: string]: {
      authData?: Record<string, string | number>;
    };
  };
};
```

### generateSchemaFromOutputData

Функция для генерации схемы выходных данных блока.

```typescript
function generateSchemaFromOutputData(outputData: any[]): OutputBlockVariables[];
```

- `outputData` - массив объектов с выходными данными блока
- Возвращает массив `OutputBlockVariables[]` с автоматически определенными типами полей

Поддерживаемые типы:

- `string` - строковые значения
- `long` - целые числа
- `double` - числа с плавающей точкой
- `boolean` - логические значения
- `dateTime` - даты (ISO 8601)
- `bigInteger` - большие целые числа
- `bigDecimal` - большие числа с плавающей точкой
- `array` - массивы
- `object` - объекты
- `file` - файлы (base64)

## Как это работает

1. **BlockExecutor** - выполняет отдельные блоки интеграции с переданными данными
2. **ConnectionExecutor** - обрабатывает подключения, включая кнопочные поля с `typeOptions` (redirect, saveFields, message)
3. **Service** - эмулирует ExecuteService для HTTP-запросов через XMLHttpRequest, включая методы `stringError`, `hook`, `base64Encode/Decode`
4. **IntegrationExecutor** - координирует выполнение, управляет контекстом и серийными запусками
5. **SchemaGenerator** - автоматически определяет типы данных и генерирует схему выходных переменных

При серийном выполнении:

- Контекст (state) передается между итерациями
- Поддерживается как синхронное, так и асинхронное выполнение блоков
- Выполнение прерывается, если `hasNext === false`
- Максимум 100,000 итераций для защиты от бесконечных циклов

## Разработка

```bash
# Установка зависимостей
yarn install

# Сборка
yarn build

# Сборка в режиме разработки (watch mode)
yarn dev

# Проверка типов
yarn lint

# Запуск тестов
yarn test

# Запуск тестов в watch режиме
yarn test:watch

# Запуск тестов с покрытием
yarn test:coverage

# Создание релиза
yarn release
```

## Лицензия

Apache-2.0

## Ссылки

- [GitHub Repository](https://github.com/Infomaximum/integration-debugger)
- [Integration SDK](https://github.com/Infomaximum/integration-sdk)
- [Changelog](./CHANGELOG.md)
