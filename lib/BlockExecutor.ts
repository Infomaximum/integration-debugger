import type {
  BlockExecuteBundle,
  BlockMeta,
  ExecuteResult,
  ExecuteService,
  IntegrationBlock,
  IntegrationBlockExecute,
} from "@infomaximum/integration-sdk";
import { OutputValidator } from "./OutputValidator/OutputValidator/OutputValidator";

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
  public meta: BlockMeta;
  private executePagination: IntegrationBlockExecute;

  constructor({ block }: BlockExecutorParams) {
    this.meta = block.meta;

    this.executePagination = block.executePagination;
  }

  private validateOutput({ output, output_variables }: ExecuteResult): boolean {
    const validator = new OutputValidator();

    const validationResult = validator.validateOutput(output, output_variables);

    if (validationResult === true) {
      console.log("Валидация успешно выполнена!");

      return true;
    }

    console.error("Ошибки валидации:");

    validationResult.forEach((error) => console.error(`- ${error}`));

    return false;
  }

  public execute({
    service,
    authData,
    inputData,
    context,
  }: ExecuteParams): ExecuteResult<undefined> {
    const bundle = {
      inputData,
      authData,
    } satisfies BlockExecuteBundle;

    const args = [service, bundle, context] satisfies ExecutionContext;

    const result = this.executePagination.apply(null, args);

    this.validateOutput(result);

    return result;
  }
}

export { BlockExecutor };
