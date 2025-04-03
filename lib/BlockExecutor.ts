import type {
  BlockExecuteBundle,
  BlockMeta,
  ExecuteService,
  IntegrationBlock,
  IntegrationBlockExecute,
} from "@infomaximum/integration-sdk";

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

  public execute({ service, authData, inputData, context }: ExecuteParams) {
    const bundle = {
      inputData,
      authData,
    } satisfies BlockExecuteBundle;

    const args = [service, bundle, context] satisfies ExecutionContext;

    const result = this.executePagination.apply(null, args);

    return result;
  }
}

export { BlockExecutor };
