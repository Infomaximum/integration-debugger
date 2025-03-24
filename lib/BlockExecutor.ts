import type {
  ExecuteBundle,
  ExecuteService,
  IntegrationBlock,
  IntegrationBlockExecute,
} from "@infomaximum/integration-sdk";

type ExecutionContext = Parameters<IntegrationBlockExecute>;
type ExecuteParams = {
  service: ExecuteService;
  authData: Record<string, any>;
  inputData: Record<string, any>;
};

type BlockExecutorParams = {
  block: IntegrationBlock;
};

class BlockExecutor {
  private block: IntegrationBlock;
  private executePagination: IntegrationBlockExecute;

  constructor({ block }: BlockExecutorParams) {
    this.block = block;

    this.executePagination = block.executePagination;
  }

  public execute({ service, authData, inputData }: ExecuteParams) {
    const bundle = {
      inputData,
      authData,
    } satisfies ExecuteBundle;

    const context = [service, bundle, {}] satisfies ExecutionContext;

    const result = this.executePagination.apply(null, context);

    return result;
  }
}

export { BlockExecutor };
