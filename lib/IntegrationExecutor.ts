import type {
  Debugging,
  ExecuteService,
  Integration,
  IntegrationBlock,
} from "@infomaximum/integration-sdk";
import { Service } from "./Service";
import { BlockExecutor } from "./BlockExecutor";
import type { DebuggingConfig } from "./types";
import { ConnectionExecutor } from "./ConnectionExecutor";

type IntegrationExecutorParams = Debugging.DebugIntegrationOptions & {
  debuggingConfig: DebuggingConfig;
};

type ExecuteBlockParams = {
  authData?: Record<string, string | number>;
};

class IntegrationExecutor {
  private integration: Integration;

  private entityKey: string;

  private debuggingConfig: DebuggingConfig;
  private isSeries: boolean;

  constructor(integration: Integration, params: IntegrationExecutorParams) {
    this.integration = integration;

    this.debuggingConfig = params.debuggingConfig;

    this.entityKey = params.entityKey;
    this.isSeries = !!params.series;
  }

  private createService() {
    const { request, error, base64Decode, base64Encode, console } = new Service();

    const service = {
      request,
      error,
      base64Decode,
      base64Encode,
      console,
    } satisfies ExecuteService;

    return service;
  }

  public execute() {
    console.log(`Запуск интеграции: "${this.integration.meta.name}"`);

    let blocks = this.integration.blocks;

    if (this.entityKey) {
      const block = blocks.find((b) => b.meta.key === this.entityKey);

      if (!block) {
        throw new Error(`Сущность с key="${this.entityKey}" не найдена`);
      }

      blocks = [block];
    }

    const { authData } = this.executeConnection() ?? { authData: undefined };

    try {
      for (const block of blocks) {
        this.executeBlock(block, { authData });
      }

      console.log("Интеграция успешно выполнена");
    } catch (error) {
      console.error("Ошибка при выполнении интеграции:", error);
      throw error;
    }
  }

  private executeConnection() {
    if (!this.entityKey) {
      return;
    }

    const connections = this.integration.connections;

    const connectionKey = this.debuggingConfig.blocks?.[this.entityKey]?.connectionKey;

    const connection = connections.find((c) => c?.meta?.key === connectionKey);

    if (!connection) {
      return;
    }

    console.log(`Выполняется подключение: "${connection.meta.name}"`);

    const service = this.createService();

    const executableConnection = new ConnectionExecutor({ connection });

    const { authData } = this.debuggingConfig.connections?.[connection.meta.key] ?? {
      authData: {},
    };

    try {
      const result = executableConnection.execute({ service, authData: authData ?? {} });

      console.log(`Подключение "${connection.meta.name}" Выполнено`);

      return result;
    } catch (error) {
      console.error(`Подключение "${connection.meta.name}" с ошибкой:`, error);
      throw error;
    }
  }

  private executeBlock(block: IntegrationBlock, params: ExecuteBlockParams) {
    console.log(`Выполняется блок: "${block.meta.name}"`);

    const service = this.createService();

    const executableBlock = new BlockExecutor({ block });

    const { inputData, authData } = this.debuggingConfig?.blocks?.[block.meta.key] ?? {
      inputData: {},
      authData: {},
    };

    try {
      executableBlock.execute({ service, authData: params.authData ?? authData ?? {}, inputData });

      console.log(`Блок "${block.meta.name}" Выполнен`);
    } catch (error) {
      console.error(`Блок "${block.meta.name}" с ошибкой:`, error);
      throw error;
    }
  }
}

export { IntegrationExecutor };
