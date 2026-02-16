import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConnectionExecutor } from "../ConnectionExecutor";
import type {
  IntegrationConnection,
  ExecuteService,
  GlobalAuthData,
} from "@infomaximum/integration-sdk";

type TAuthData = GlobalAuthData & {
  token: string;
};

describe("ConnectionExecutor", () => {
  const mockService: ExecuteService = {
    request: vi.fn(),
    stringError: vi.fn() as any,
    base64Decode: vi.fn(),
    base64Encode: vi.fn(),
    hook: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен выполнить подключение без button полей", () => {
    const mockConnection = {
      label: "Test Connection",
      description: "",
      inputFields: [],
      execute: () => {},
      refresh: () => {},
    } as IntegrationConnection;

    const executor = new ConnectionExecutor({ connection: mockConnection });
    const authData = { token: "test-token", BASE_URL: "" } satisfies TAuthData;

    const result = executor.execute({ service: mockService, authData });

    expect(result.authData).toEqual(authData);
  });

  it("должен обработать button поле с redirect", () => {
    const redirectMock = vi.fn();

    const mockConnection = {
      label: "Test Connection",
      description: "",
      inputFields: [
        {
          key: "auth-button",
          label: "Authorize",
          type: "button",
          typeOptions: {
            redirect: redirectMock,
          },
        },
      ],
      execute: () => {},
      refresh: () => {},
    } as IntegrationConnection;

    const executor = new ConnectionExecutor({ connection: mockConnection });
    const authData = { token: "test-token", BASE_URL: "" } satisfies TAuthData;

    executor.execute({ service: mockService, authData });

    expect(redirectMock).toHaveBeenCalledWith(mockService, expect.objectContaining({ authData }));
  });

  it("должен обработать button поле с saveFields", () => {
    const saveFieldsMock = vi.fn().mockReturnValue({ newField: "newValue" });

    const mockConnection = {
      label: "Test Connection",
      description: "",
      inputFields: [
        {
          key: "save-button",
          label: "Save",
          type: "button",
          typeOptions: {
            saveFields: saveFieldsMock,
          },
        },
      ],
      execute: () => {},
      refresh: () => {},
    } as IntegrationConnection;

    const executor = new ConnectionExecutor({ connection: mockConnection });
    const authData = { token: "test-token", BASE_URL: "" } satisfies TAuthData;

    const result = executor.execute({ service: mockService, authData });

    expect(saveFieldsMock).toHaveBeenCalled();
    expect(result.authData).toEqual({ BASE_URL: "", token: "test-token", newField: "newValue" });
  });

  it("должен обработать button поле с message (строка)", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation();

    const mockConnection = {
      label: "Test Connection",
      description: "",
      inputFields: [
        {
          key: "message-button",
          label: "Show Message",
          type: "button",
          typeOptions: {
            message: () => "Test message",
          },
        },
      ],
      execute: () => {},
      refresh: () => {},
    } as IntegrationConnection;

    const executor = new ConnectionExecutor({ connection: mockConnection });

    executor.execute({
      service: mockService,
      authData: { token: "test-token", BASE_URL: "" } satisfies TAuthData,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith("Test message");

    consoleLogSpy.mockRestore();
  });

  it("должен обработать button поле с message (функция)", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation();
    const messageFn = vi.fn().mockReturnValue("Dynamic message");

    const mockConnection = {
      label: "Test Connection",
      description: "",
      inputFields: [
        {
          key: "message-button",
          label: "Show Message",
          type: "button",
          typeOptions: {
            message: messageFn,
          },
        },
      ],
      execute: () => {},
      refresh: () => {},
    } as IntegrationConnection;

    const executor = new ConnectionExecutor({ connection: mockConnection });

    executor.execute({
      service: mockService,
      authData: { token: "test-token", BASE_URL: "" } satisfies TAuthData,
    });

    expect(messageFn).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("Dynamic message");

    consoleLogSpy.mockRestore();
  });

  it("должен вызвать connection.execute если он определен", () => {
    const executeMock = vi.fn();

    const mockConnection = {
      label: "Test Connection",
      description: "",
      inputFields: [],
      execute: executeMock,
      refresh: () => {},
    } as IntegrationConnection;

    const executor = new ConnectionExecutor({ connection: mockConnection });
    const authData = { token: "test-token", BASE_URL: "" } satisfies TAuthData;

    executor.execute({ service: mockService, authData });

    expect(executeMock).toHaveBeenCalledWith(mockService, expect.objectContaining({ authData }));
  });

  it("должен клонировать authData для предотвращения мутаций", () => {
    const mockConnection = {
      label: "Test Connection",
      description: "",
      inputFields: [],
      execute: () => {},
      refresh: () => {},
    } as IntegrationConnection;

    const executor = new ConnectionExecutor({ connection: mockConnection });
    const originalAuthData = { token: "test-token", BASE_URL: "" } satisfies TAuthData;

    const result = executor.execute({ service: mockService, authData: originalAuthData });

    expect(result.authData).toEqual(originalAuthData);
    expect(result.authData).not.toBe(originalAuthData);
  });
});
