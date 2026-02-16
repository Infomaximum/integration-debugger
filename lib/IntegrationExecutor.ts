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
import { generateSchemaFromOutputData } from "./SchemaGenerator";
import { Logger } from "./Logger";

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
  private isGenerateSchema: boolean;

  constructor(integration: Integration, params: IntegrationExecutorParams) {
    this.integration = integration;

    this.debuggingConfig = params.debuggingConfig;

    this.entityKey = params.entityKey;
    this.isSeries = !!params.series;
    this.isGenerateSchema = !!params.isGenerateSchema;
  }

  private createService(): ExecuteService {
    const serviceInstance = new Service();

    const service = {
      request: serviceInstance.request.bind(serviceInstance),
      stringError: serviceInstance.stringError.bind(serviceInstance),
      base64Decode: serviceInstance.base64Decode.bind(serviceInstance),
      base64Encode: serviceInstance.base64Encode.bind(serviceInstance),
      hook: serviceInstance.hook.bind(serviceInstance),
    } satisfies ExecuteService;

    return service;
  }

  public execute() {
    const executableConnection = this.integration.connections[this.entityKey];
    const executableBlock = this.integration.blocks[this.entityKey];

    if (executableConnection) {
      this.executeConnection(executableConnection, this.entityKey);
    } else if (executableBlock) {
      return this.executeBlockWithConnection(executableBlock);
    } else {
      throw new Error(`Сущность с key=${this.entityKey} не найдена в блоках и подключениях`);
    }
  }

  private async executeBlockWithConnection(executableBlock: IntegrationBlock) {
    const connectionKey = this.debuggingConfig.blocks?.[this.entityKey]?.connectionKey;

    const connection = connectionKey ? this.integration.connections[connectionKey] : undefined;

    let authData: Record<string, any> | undefined;

    if (connection && connectionKey) {
      const result = this.executeConnection(connection, connectionKey) ?? { authData: undefined };

      authData = result.authData;
    } else if (connectionKey && !connection) {
      Logger.warn(`Подключение с key=${connectionKey}, не найдено`);
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
      Logger.log(`Выполняется серия запусков блока: "${executableBlock.label}"`);
    } else {
      Logger.log(`Выполняется блок: "${executableBlock.label}"`);
    }
    for (let index = 0; index < seriesCount; index++) {
      try {
        const result = await this.executeBlock(blockExecutor, {
          authData,
          context,
        });

        if (!this.isSeries && this.isGenerateSchema && index === 0) {
          try {
            Logger.success(JSON.stringify(generateSchemaFromOutputData(result.output), null, 2));
          } catch (error) {
            Logger.error(`Ошибка при генерации схемы! ${JSON.stringify(error)}`);
          }
        }

        context = result?.state ? structuredClone(result.state) : undefined;

        if (result?.hasNext === false) {
          break;
        }
      } catch (error) {
        Logger.error(`Блок "${executableBlock.label}" с ошибкой:`);
        throw error;
      }
    }
  }

  private executeConnection(connection: IntegrationConnection, connectionKey: string) {
    Logger.log(`Выполняется подключение: "${connection.label}"`);

    const service = this.createService();

    const executableConnection = new ConnectionExecutor({ connection });

    const { authData } = this.debuggingConfig.connections?.[connectionKey] ?? {
      authData: {},
    };

    const resultAuthData = Object.assign({}, authData, this.debuggingConfig.commonAuthData);

    try {
      const result = executableConnection.execute({ service, authData: resultAuthData });

      Logger.log(`Подключение "${connection.label}" выполнено`);

      return result;
    } catch (error) {
      Logger.error(`Подключение "${connection.label}" с ошибкой: ${JSON.stringify(error)}`);

      throw error;
    }
  }

  private async executeBlock(executableBlock: BlockExecutor, params: ExecuteBlockParams) {
    const service = this.createService();

    const { inputData, authData } = this.debuggingConfig?.blocks?.[this.entityKey] ?? {
      inputData: {},
      authData: {},
    };

    const resultAuthData = Object.assign(
      {},
      params.authData ?? authData,
      this.debuggingConfig.commonAuthData
    );

    try {
      const result = await executableBlock.execute({
        service,
        authData: resultAuthData,
        inputData,
        context: params.context,
      });

      Logger.log(`Блок "${executableBlock.label}" выполнен!`);

      return result;
    } catch (error) {
      Logger.error(`Блок "${executableBlock.label}" с ошибкой: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}

export { IntegrationExecutor };
