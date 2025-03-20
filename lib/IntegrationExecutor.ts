import type {
  ExecuteService,
  Integration,
  IntegrationBlock,
  IntegrationBlockExecute,
} from "@infomaximum/integration-sdk";
import { Service } from "./Service";

type ExecutionContext = Parameters<IntegrationBlockExecute>;

class IntegrationExecutor {
  private integration: Integration;

  private blockId: string | undefined;

  constructor(integration: Integration, blockId?: string) {
    this.integration = integration;

    this.blockId = blockId;
  }

  private createExecutionContext(): ExecutionContext {
    const { request, error, base64Decode, base64Encode, console } = new Service();

    const service = {
      request,
      error,
      base64Decode,
      base64Encode,
      console,
    } satisfies ExecuteService;

    //@ts-expect-error
    return [service];
  }

  public async execute() {
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
        await this.executeBlock(block);
      }

      console.log("Интеграция успешно выполнена");
    } catch (error) {
      console.error("Ошибка при выполнении интеграции:", error);
      throw error;
    }
  }

  private async executeBlock(block: IntegrationBlock) {
    console.log(`Выполняется блок: ${block.meta.name}`);

    try {
      const result = await this.callBlockFunction(
        block.executePagination,
        this.createExecutionContext()
      );

      console.log(`Блок ${block.meta.name} Выполнен`);
      return result;
    } catch (error) {
      console.error(`Блок ${block.meta.name} с ошибкой:`, error);
      throw error;
    }
  }

  private async callBlockFunction(fn: IntegrationBlockExecute, context: ExecutionContext) {
    const result = fn.call(null, ...context);

    return result;
  }
}

export { IntegrationExecutor };
