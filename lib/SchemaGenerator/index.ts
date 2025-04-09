import type { OutputBlockVariables } from "@infomaximum/integration-sdk";
import { SchemaGenerator } from "./SchemaGenerator/SchemaGenerator";

export function generateSchemaFromOutputData(outputData: any[]): OutputBlockVariables[] {
  const generator = new SchemaGenerator();

  return generator.generate(outputData);
}
