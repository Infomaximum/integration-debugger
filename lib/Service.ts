import type { ExecuteService, RequestConfig } from "@infomaximum/integration-sdk";
//@ts-expect-error
import { XMLHttpRequest as _XMLHttpRequest } from "xmlhttprequest";
import { Logger } from "./Logger";

class Service implements ExecuteService {
  public request(config: RequestConfig) {
    const { method, url, headers } = config;

    //@ts-expect-error
    const xhr = new _XMLHttpRequest();

    xhr.open(method, url, false);

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    if (method === "GET") {
      xhr.send();
    } else {
      xhr.send(config.jsonBody || config.multipartBody);
    }

    if (xhr.status === 200) {
      return { response: JSON.parse(xhr.responseText), status: xhr.status };
    } else {
      return { response: JSON.parse(xhr.statusText), status: xhr.status };
    }
  }

  public stringError(message: string): never {
    Logger.error(message);

    throw new Error(message);
  }

  public hook(
    _fn: (url: string, headers: Record<string, string>) => string,
    _guid: string,
    _timeout: number
  ): string | undefined {
    return undefined;
  }

  public base64Encode(input: string) {
    return btoa(unescape(encodeURIComponent(input)));
  }

  public base64Decode(input: string) {
    return decodeURIComponent(escape(atob(input)));
  }

  public console(input: string) {
    console.log(input);
  }
}

export { Service };
