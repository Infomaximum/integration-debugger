import type {
  BlockInputField,
  BlockMeta,
  ExecuteBundle,
  ExecuteService,
  IntegrationBlock,
  IntegrationBlockExecute,
} from "@infomaximum/integration-sdk";

type ExecutionContext = Parameters<IntegrationBlockExecute>;
type ExecuteParams = { service: ExecuteService; authData: Record<string, any> };

type BlockExecutorParams = {
  block: IntegrationBlock;
};

class BlockExecutor {
  private block: IntegrationBlock;
  private meta: BlockMeta;
  private inputFields: BlockInputField[];
  private executePagination: IntegrationBlockExecute;

  constructor({ block }: BlockExecutorParams) {
    this.block = block;
    this.meta = block.meta;
    this.inputFields = block.inputFields;
    this.executePagination = block.executePagination;
  }

  private generateRandomDataByType(field: BlockInputField) {
    switch (field.type) {
      case "text":
      case "textPlain":
      case "sqlArea":
        return `Text ${Math.ceil(Math.random() * 100000)}`;
      case "numberPlain":
        return Math.ceil(Math.random() * 100000);
      case "switcher":
        return Math.random() > 0.5;
      default:
        return "Не обработан тип филда";
    }
  }

  public execute({ service, authData }: ExecuteParams) {
    const inputData = this.inputFields.map((field) => ({
      [field.key]: this.generateRandomDataByType(field),
    }));

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
