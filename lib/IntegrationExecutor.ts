import type { ExecuteService, Integration, IntegrationBlock } from "@infomaximum/integration-sdk";
import { Service } from "./Service";
import { BlockExecutor } from "./BlockExecutor";
import type { DebuggingConfig } from "./types";

export type ExecuteEntity = "integration" | "block";

type ExecuteCommonParams = {
  debuggingConfig: DebuggingConfig;
};

export type ExecuteParamsBlock = {
  type: "block";
  blockId: string;
} & ExecuteCommonParams;

export type ExecuteParamsIntegration = {
  type: "integration";
} & ExecuteCommonParams;

class IntegrationExecutor {
  private integration: Integration;

  private blockId: string | undefined;

  private debuggingConfig: DebuggingConfig;

  constructor(integration: Integration, params: ExecuteParamsIntegration | ExecuteParamsBlock) {
    this.integration = integration;

    this.debuggingConfig = params.debuggingConfig;

    if (params.type === "block") {
      this.blockId = params.blockId;
    }
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
    console.log(`Запуск интеграции: ${this.integration.meta.name}`);

    let blocks = this.integration.blocks;

    if (this.blockId) {
      const block = blocks.find((b) => b.meta.key === this.blockId);

      if (!block) {
        throw new Error(`Блок с key="${this.blockId}" не найден`);
      }

      blocks = [block];
    }

    try {
      for (const block of blocks) {
        this.executeBlock(block);
      }

      console.log("Интеграция успешно выполнена");
    } catch (error) {
      console.error("Ошибка при выполнении интеграции:", error);
      throw error;
    }
  }

  private executeBlock(block: IntegrationBlock) {
    console.log(`Выполняется блок: ${block.meta.name}`);

    const service = this.createService();

    const executableBlock = new BlockExecutor({ block });

    const { inputData, authData } = this.debuggingConfig.blocks[block.meta.key] ?? {
      inputData: {},
      authData: {},
    };

    try {
      executableBlock.execute({ service, authData: authData ?? {}, inputData });

      console.log(`Блок ${block.meta.name} Выполнен`);
    } catch (error) {
      console.error(`Блок ${block.meta.name} с ошибкой:`, error);
      throw error;
    }
  }
}

export { IntegrationExecutor };
