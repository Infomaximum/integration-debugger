import type {
  ConnectionExecuteBundle,
  ExecuteService,
  GlobalAuthData,
  IntegrationConnection,
} from "@infomaximum/integration-sdk";

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
    const buttonFields = this.connection.inputFields.filter((f) => f.type === "button");

    const copyAuthData = structuredClone(authData);

    const bundle = {
      authData: copyAuthData,
    } satisfies ConnectionExecuteBundle<ConnectionExecuteParams["authData"]>;

    for (const buttonField of buttonFields) {
      buttonField.executeWithRedirect?.(service, bundle);

      const result = buttonField.executeWithSaveFields?.(service, bundle);

      if (result) {
        Object.assign(bundle.authData, result);
      }

      const message = buttonField.executeWithMessage?.(service, bundle);

      if (message) {
        console.log(message);
      }
    }

    this.connection.execute?.call(null, service, bundle);

    return { authData: bundle.authData };
  }
}
