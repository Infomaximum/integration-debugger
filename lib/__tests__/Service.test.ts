import { describe, it, expect, beforeEach, vi } from "vitest";
import { Service } from "../Service";

describe("Service", () => {
  let service: Service;

  beforeEach(() => {
    service = new Service();
  });

  describe("base64Encode", () => {
    it("должен кодировать строку в base64", () => {
      const input = "Hello World";
      const result = service.base64Encode(input);
      expect(result).toBe("SGVsbG8gV29ybGQ=");
    });

    it("должен корректно кодировать UTF-8 символы", () => {
      const input = "Привет";
      const result = service.base64Encode(input);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });
  });

  describe("base64Decode", () => {
    it("должен декодировать base64 строку", () => {
      const input = "SGVsbG8gV29ybGQ=";
      const result = service.base64Decode(input);
      expect(result).toBe("Hello World");
    });

    it("должен корректно декодировать UTF-8 символы", () => {
      const encoded = service.base64Encode("Привет");
      const decoded = service.base64Decode(encoded);
      expect(decoded).toBe("Привет");
    });
  });

  describe("stringError", () => {
    it("должен выбросить ошибку с сообщением", () => {
      const errorMessage = "Test error";
      expect(() => service.stringError(errorMessage)).toThrow(errorMessage);
    });
  });

  describe("hook", () => {
    it("должен вернуть undefined", () => {
      const fn = vi.fn();
      const result = service.hook(fn, "test-guid", 1000);
      expect(result).toBeUndefined();
    });
  });
});
