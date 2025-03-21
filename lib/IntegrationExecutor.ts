import type { ExecuteService, Integration, IntegrationBlock } from "@infomaximum/integration-sdk";
import { Service } from "./Service";
import { BlockExecutor } from "./BlockExecutor";

export type ExecuteEntity = "integration" | "block";

export type ExecuteParamsBlock = {
  type: "block";
  blockId: string;
};

export type ExecuteParamsIntegration = {
  type: "integration";
};

class IntegrationExecutor {
  private integration: Integration;

  private blockId: string | undefined;

  constructor(integration: Integration, params: ExecuteParamsIntegration | ExecuteParamsBlock) {
    this.integration = integration;

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

    const authData = {};

    const executableBlock = new BlockExecutor({ block });

    try {
      executableBlock.execute({ service, authData });

      console.log(`Блок ${block.meta.name} Выполнен`);
    } catch (error) {
      console.error(`Блок ${block.meta.name} с ошибкой:`, error);
      throw error;
    }
  }
}

export { IntegrationExecutor };
