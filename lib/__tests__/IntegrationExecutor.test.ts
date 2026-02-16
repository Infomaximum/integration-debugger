import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { IntegrationExecutor } from "../IntegrationExecutor";
import type {
  Integration,
  IntegrationBlock,
  IntegrationConnection,
} from "@infomaximum/integration-sdk";

describe("IntegrationExecutor", () => {
  const mockBlock = {
    label: "Test Block",
    executePagination: vi.fn().mockResolvedValue({
      output: [],
      output_variables: [],
      hasNext: false,
    }),
    inputFields: [],
    outputFields: [],
  } as unknown as IntegrationBlock;

  const mockConnection = {
    label: "Test Connection",
    inputFields: [],
  } as unknown as IntegrationConnection;

  const mockIntegration = {
    label: "Test Integration",
    blocks: {
      "test-block": mockBlock,
    },
    connections: {
      "test-connection": mockConnection,
    },
  } as unknown as Integration;

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("execute", () => {
    it("должен выполнить блок", async () => {
      const executor = new IntegrationExecutor(mockIntegration, {
        entityKey: "test-block",
        debuggingConfig: {
          blocks: {
            "test-block": {
              inputData: { param: "value" },
            },
          },
        },
      });

      await executor.execute();

      expect(mockBlock.executePagination).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Test Block"));
    });

    it("должен выполнить подключение", () => {
      const executor = new IntegrationExecutor(mockIntegration, {
        entityKey: "test-connection",
        debuggingConfig: {
          blocks: {},
          connections: {
            "test-connection": {
              authData: { token: "test" },
            },
          },
        },
      });

      executor.execute();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Test Connection"));
    });

    it("должен выбросить ошибку если сущность не найдена", () => {
      const executor = new IntegrationExecutor(mockIntegration, {
        entityKey: "non-existent",
        debuggingConfig: {
          blocks: {},
        },
      });

      expect(() => executor.execute()).toThrow("Сущность с key=non-existent не найдена");
    });
  });

  describe("series execution", () => {
    it("должен выполнить блок несколько раз в серии", async () => {
      const executePaginationMock = vi
        .fn()
        .mockResolvedValueOnce({
          output: [],
          output_variables: [],
          hasNext: true,
          state: { page: 1 },
        })
        .mockResolvedValueOnce({
          output: [],
          output_variables: [],
          hasNext: true,
          state: { page: 2 },
        })
        .mockResolvedValueOnce({
          output: [],
          output_variables: [],
          hasNext: false,
        });

      const seriesBlock = {
        ...mockBlock,
        executePagination: executePaginationMock,
      } as unknown as IntegrationBlock;

      const seriesIntegration = {
        ...mockIntegration,
        blocks: {
          "test-block": seriesBlock,
        },
      } as unknown as Integration;

      const executor = new IntegrationExecutor(seriesIntegration, {
        entityKey: "test-block",
        series: true,
        debuggingConfig: {
          seriesIterations: 5,
          blocks: {
            "test-block": {
              inputData: {},
            },
          },
        },
      });

      await executor.execute();

      expect(executePaginationMock).toHaveBeenCalledTimes(3);
    });

    it("должен использовать значение по умолчанию для seriesIterations", async () => {
      const executePaginationMock = vi
        .fn()
        .mockResolvedValueOnce({ output: [], output_variables: [], hasNext: true })
        .mockResolvedValueOnce({ output: [], output_variables: [], hasNext: true })
        .mockResolvedValueOnce({ output: [], output_variables: [], hasNext: false });

      const seriesBlock = {
        ...mockBlock,
        executePagination: executePaginationMock,
      } as unknown as IntegrationBlock;

      const seriesIntegration = {
        ...mockIntegration,
        blocks: {
          "test-block": seriesBlock,
        },
      } as unknown as Integration;

      const executor = new IntegrationExecutor(seriesIntegration, {
        entityKey: "test-block",
        series: true,
        debuggingConfig: {
          blocks: {
            "test-block": {
              inputData: {},
            },
          },
        },
      });

      await executor.execute();

      expect(executePaginationMock).toHaveBeenCalledTimes(3);
    });
  });

  describe("block with connection", () => {
    it("должен выполнить блок с подключением", async () => {
      const connectionExecuteMock = vi.fn();
      const blockExecuteMock = vi.fn().mockResolvedValue({
        output: [],
        output_variables: [],
        hasNext: false,
      });

      const testBlock = {
        label: "Test Block",
        executePagination: blockExecuteMock,
        inputFields: [],
        outputFields: [],
      } as unknown as IntegrationBlock;

      const connectionWithExecute = {
        ...mockConnection,
        execute: connectionExecuteMock,
      } as unknown as IntegrationConnection;

      const integrationWithConnection = {
        label: "Test Integration",
        blocks: {
          "test-block": testBlock,
        },
        connections: {
          "test-connection": connectionWithExecute,
        },
      } as unknown as Integration;

      const executor = new IntegrationExecutor(integrationWithConnection, {
        entityKey: "test-block",
        debuggingConfig: {
          blocks: {
            "test-block": {
              inputData: {},
              connectionKey: "test-connection",
            },
          },
          connections: {
            "test-connection": {
              authData: { token: "test" },
            },
          },
        },
      });

      await executor.execute();

      expect(connectionExecuteMock).toHaveBeenCalled();
      expect(blockExecuteMock).toHaveBeenCalled();
    });

    it("должен предупредить если подключение не найдено", async () => {
      const blockExecuteMock = vi.fn().mockResolvedValue({
        output: [],
        output_variables: [],
        hasNext: false,
      });

      const testBlock = {
        label: "Test Block",
        executePagination: blockExecuteMock,
        inputFields: [],
        outputFields: [],
      } as unknown as IntegrationBlock;

      const testIntegration = {
        label: "Test Integration",
        blocks: {
          "test-block": testBlock,
        },
        connections: {
          "test-connection": mockConnection,
        },
      } as unknown as Integration;

      const executor = new IntegrationExecutor(testIntegration, {
        entityKey: "test-block",
        debuggingConfig: {
          blocks: {
            "test-block": {
              inputData: {},
              connectionKey: "non-existent-connection",
            },
          },
        },
      });

      await executor.execute();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("non-existent-connection"));
    });
  });

  describe("error handling", () => {
    it("должен обработать ошибку при выполнении блока", async () => {
      const errorBlock = {
        ...mockBlock,
        executePagination: vi.fn().mockImplementation(() => {
          throw new Error("Block error");
        }),
      } as unknown as IntegrationBlock;

      const errorIntegration = {
        ...mockIntegration,
        blocks: {
          "test-block": errorBlock,
        },
      } as unknown as Integration;

      const executor = new IntegrationExecutor(errorIntegration, {
        entityKey: "test-block",
        debuggingConfig: {
          blocks: {
            "test-block": {
              inputData: {},
            },
          },
        },
      });

      await expect(executor.execute()).rejects.toThrow("Block error");
      expect(console.log).toHaveBeenCalled();
    });

    it("должен обработать ошибку при выполнении подключения", () => {
      const errorConnection = {
        ...mockConnection,
        execute: vi.fn().mockImplementation(() => {
          throw new Error("Connection error");
        }),
      } as unknown as IntegrationConnection;

      const errorIntegration = {
        ...mockIntegration,
        connections: {
          "test-connection": errorConnection,
        },
      } as unknown as Integration;

      const executor = new IntegrationExecutor(errorIntegration, {
        entityKey: "test-connection",
        debuggingConfig: {
          blocks: {},
          connections: {
            "test-connection": {
              authData: {},
            },
          },
        },
      });

      expect(() => executor.execute()).toThrow("Connection error");
      expect(console.log).toHaveBeenCalled();
    });

    it("должен обработать асинхронную ошибку при выполнении блока", async () => {
      const errorBlock = {
        ...mockBlock,
        executePagination: vi.fn().mockRejectedValue(new Error("Async block error")),
      } as unknown as IntegrationBlock;

      const errorIntegration = {
        ...mockIntegration,
        blocks: {
          "test-block": errorBlock,
        },
      } as unknown as Integration;

      const executor = new IntegrationExecutor(errorIntegration, {
        entityKey: "test-block",
        debuggingConfig: {
          blocks: {
            "test-block": {
              inputData: {},
            },
          },
        },
      });

      await expect(executor.execute()).rejects.toThrow("Async block error");
    });
  });
});
