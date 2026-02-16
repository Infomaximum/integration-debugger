import type {
  BlockExecuteBundle,
  ExecuteResult,
  ExecuteService,
  IntegrationBlock,
  IntegrationBlockExecute,
} from "@infomaximum/integration-sdk";
import { OutputValidator } from "./OutputValidator/OutputValidator/OutputValidator";
import { Logger } from "./Logger";

type ExecutionContext = Parameters<
  IntegrationBlockExecute<{}, {}, Record<string, any> | undefined>
>;
type ExecuteParams = {
  service: ExecuteService;
  authData: Record<string, any>;
  inputData: Record<string, any>;
  context: Record<string, any> | undefined;
};

type BlockExecutorParams = {
  block: IntegrationBlock;
};

class BlockExecutor {
  public label: string;
  private executePagination: IntegrationBlockExecute;

  constructor({ block }: BlockExecutorParams) {
    this.label = block.label;

    this.executePagination = block.executePagination;
  }

  private validateOutput({ output, output_variables }: ExecuteResult): boolean {
    const validator = new OutputValidator();

    const validationResult = validator.validateOutput(output, output_variables);

    if (validationResult === true) {
      Logger.log("Валидация успешно выполнена!");

      return true;
    }

    Logger.error("Ошибки валидации:");

    validationResult.forEach((error) => Logger.error(`- ${error}`));

    return false;
  }

  public async execute({
    service,
    authData,
    inputData,
    context,
  }: ExecuteParams): Promise<ExecuteResult<undefined>> {
    const bundle = {
      inputData,
      authData,
    } satisfies BlockExecuteBundle<any>;

    const args = [service, bundle, context] as ExecutionContext;

    const result = await this.executePagination.apply(null, args);

    this.validateOutput(result);

    return result;
  }
}

export { BlockExecutor };
