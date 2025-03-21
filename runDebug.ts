import minimist from "minimist";
import { IntegrationExecutor } from "./lib/IntegrationExecutor";

function runIntegration(argv: minimist.ParsedArgs) {
  const debugTypeFlagName = "debugType";
  const blockIdFlagName = "blockId";

  const debugType = argv[debugTypeFlagName] as "block" | "integration" | undefined;
  const blockId = argv[blockIdFlagName] as string | undefined;

  if (!debugType) {
    return;
  }

  let executor: IntegrationExecutor | undefined;

  if (debugType === "integration") {
    executor = new IntegrationExecutor(globalThis.integration, { type: debugType });
  } else if (debugType === "block") {
    if (!blockId) {
      throw new Error("Не передан blockId");
    }

    executor = new IntegrationExecutor(globalThis.integration, { type: debugType, blockId });
  }

  try {
    executor?.execute();
  } catch (error) {
    console.error("Integration execution failed:", error);
  }
}

function run() {
  const argv = minimist(process.argv.slice(2));

  const entryPathFlagName = "entryPath";

  const entryPath = argv[entryPathFlagName] as string | undefined;

  if (!entryPath) {
    throw new Error("Не задан путь до entry (entryPath)");
  }

  import(entryPath).then(() => {
    runIntegration(argv);
  });
}

run();
