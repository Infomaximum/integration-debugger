import type {
  Debugging,
  ExecuteService,
  Integration,
  IntegrationBlock,
  IntegrationConnection,
} from "@infomaximum/integration-sdk";
import { Service } from "./Service";
import { BlockExecutor } from "./BlockExecutor";
import type { DebuggingConfig } from "./types";
import { ConnectionExecutor } from "./ConnectionExecutor";
import { DEFAULT_SERIES_ITERATIONS } from "./const";

type IntegrationExecutorParams = Debugging.DebugIntegrationOptions & {
  debuggingConfig: DebuggingConfig;
};

type ExecuteBlockParams = {
  authData?: Record<string, string | number>;
  context: Record<string, any> | undefined;
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

  private createService(): ExecuteService {
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
    const executableConnection = this.integration.connections.find(
      (c) => c.meta.key === this.entityKey
    );

    const executableBlock = this.integration.blocks.find((b) => b.meta.key === this.entityKey);

    if (executableConnection) {
      this.executeConnection(executableConnection);
    } else if (executableBlock) {
      this.executeBlockWithConnection(executableBlock);
    } else {
      throw new Error(`Сущность с key=${this.entityKey} не найдена в блоках и подключениях`);
    }
  }

  private executeBlockWithConnection(executableBlock: IntegrationBlock) {
    const connectionKey = this.debuggingConfig.blocks?.[this.entityKey]?.connectionKey;

    const connection =
      !!connectionKey && this.integration.connections.find((c) => c?.meta?.key === connectionKey);

    let authData: Record<string, any> | undefined;

    if (connection) {
      const result = this.executeConnection(connection) ?? { authData: undefined };

      authData = result.authData;
    } else if (connectionKey && !connection) {
      console.warn(`Подключение с key=${connectionKey}, не найдено`);
    }

    const seriesCount = this.isSeries
      ? Math.min(
          Math.abs(this.debuggingConfig.seriesIterations ?? DEFAULT_SERIES_ITERATIONS),
          100_000
        )
      : 1;

    let context = undefined;

    const blockExecutor = new BlockExecutor({ block: executableBlock });

    if (this.isSeries) {
      console.log(`Выполняется серия запусков блока: "${executableBlock.meta.name}"`);
    } else {
      console.log(`Выполняется блок: "${executableBlock.meta.name}"`);
    }
    for (let index = 0; index < seriesCount; index++) {
      const result = this.executeBlock(blockExecutor, {
        authData,
        context,
      });

      context = result?.state ? structuredClone(result.state) : undefined;

      if (result?.hasNext === false) {
        break;
      }
    }
  }

  private executeConnection(connection: IntegrationConnection) {
    console.log(`Выполняется подключение: "${connection.meta.name}"`);

    const service = this.createService();

    const executableConnection = new ConnectionExecutor({ connection });

    const { authData } = this.debuggingConfig.connections?.[connection.meta.key] ?? {
      authData: {},
    };

    try {
      const result = executableConnection.execute({ service, authData: authData ?? {} });

      console.log(`Подключение "${connection.meta.name}" выполнено`);

      return result;
    } catch (error) {
      console.error(`Подключение "${connection.meta.name}" с ошибкой:`, error);
      throw error;
    }
  }

  private executeBlock(executableBlock: BlockExecutor, params: ExecuteBlockParams) {
    const service = this.createService();

    const { inputData, authData } = this.debuggingConfig?.blocks?.[executableBlock.meta.key] ?? {
      inputData: {},
      authData: {},
    };

    try {
      const result = executableBlock.execute({
        service,
        authData: params.authData ?? authData ?? {},
        inputData,
        context: params.context,
      });

      console.log(`Блок "${executableBlock.meta.name}" выполнен:`);
      console.log(JSON.stringify(result));

      return result;
    } catch (error) {
      console.error(`Блок "${executableBlock.meta.name}" с ошибкой:`, error);
      throw error;
    }
  }
}

export { IntegrationExecutor };
