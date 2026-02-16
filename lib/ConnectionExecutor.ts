import type {
  ButtonInputFieldConnection,
  ConnectionExecuteBundle,
  ExecuteService,
  GlobalAuthData,
  IntegrationConnection,
} from "@infomaximum/integration-sdk";
import { Logger } from "./Logger";

type ConnectionExecutorParams = {
  connection: IntegrationConnection;
};

type ConnectionExecuteParams = {
  service: ExecuteService;
  authData: GlobalAuthData & Record<string, any>;
};

export class ConnectionExecutor {
  private connection: IntegrationConnection;

  constructor({ connection }: ConnectionExecutorParams) {
    this.connection = connection;
  }

  public execute({ authData, service }: ConnectionExecuteParams) {
    const buttonFields = this.connection.inputFields.filter(
      (f) => typeof f === "object" && "type" in f && f.type === "button"
    ) as ButtonInputFieldConnection<any>[];

    const copyAuthData = structuredClone(authData);

    const bundle = {
      authData: copyAuthData,
    } satisfies ConnectionExecuteBundle<ConnectionExecuteParams["authData"]>;

    for (const buttonField of buttonFields) {
      if (buttonField.typeOptions?.redirect) {
        buttonField.typeOptions.redirect(service, bundle);
      }

      if (buttonField.typeOptions?.saveFields) {
        const result = buttonField.typeOptions.saveFields(service, bundle);

        if (result) {
          Object.assign(bundle.authData, result);
        }
      }

      if (buttonField.typeOptions?.message) {
        const messageOrFn = buttonField.typeOptions.message;

        const message =
          typeof messageOrFn === "function" ? messageOrFn(service, bundle) : messageOrFn;

        if (message) {
          Logger.log(message);
        }
      }
    }

    this.connection.execute?.call(null, service, bundle);

    return { authData: bundle.authData };
  }
}
