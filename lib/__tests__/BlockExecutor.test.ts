import { describe, it, expect, vi } from "vitest";
import { BlockExecutor } from "../BlockExecutor";
import type { IntegrationBlock, ExecuteService } from "@infomaximum/integration-sdk";

describe("BlockExecutor", () => {
  const mockService: ExecuteService = {
    request: vi.fn(),
    stringError: vi.fn() as any,
    base64Decode: vi.fn(),
    base64Encode: vi.fn(),
    hook: vi.fn(),
  };

  it("должен создать экземпляр с label из блока", () => {
    const mockBlock = {
      label: "Test Block",
      executePagination: vi.fn(),
      inputFields: [],
      outputFields: [],
    } as unknown as IntegrationBlock;

    const executor = new BlockExecutor({ block: mockBlock });
    expect(executor.label).toBe("Test Block");
  });

  it("должен выполнить блок с корректными параметрами", async () => {
    const executePaginationMock = vi.fn().mockResolvedValue({
      output: [],
      output_variables: [],
      hasNext: false,
    });

    const mockBlock = {
      label: "Test Block",
      executePagination: executePaginationMock,
      inputFields: [],
      outputFields: [],
    } as unknown as IntegrationBlock;

    const executor = new BlockExecutor({ block: mockBlock });

    const authData = { token: "test-token" };
    const inputData = { param: "value" };
    const context = { state: "initial" };

    const result = await executor.execute({
      service: mockService,
      authData,
      inputData,
      context,
    });

    expect(executePaginationMock).toHaveBeenCalledWith(
      mockService,
      { inputData, authData },
      context
    );
    expect(result).toEqual({ output: [], output_variables: [], hasNext: false });
  });

  it("должен работать без context", async () => {
    const executePaginationMock = vi.fn().mockResolvedValue({
      output: [],
      output_variables: [],
      hasNext: false,
    });

    const mockBlock = {
      label: "Test Block",
      executePagination: executePaginationMock,
      inputFields: [],
      outputFields: [],
    } as unknown as IntegrationBlock;

    const executor = new BlockExecutor({ block: mockBlock });

    await executor.execute({
      service: mockService,
      authData: {},
      inputData: {},
      context: undefined,
    });

    expect(executePaginationMock).toHaveBeenCalledWith(
      mockService,
      { inputData: {}, authData: {} },
      undefined
    );
  });
});
