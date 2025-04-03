import type { GlobalAuthData } from "@infomaximum/integration-sdk";

export type DebuggingBlockConfig = {
  /** Мок данные для выполнения блока */
  inputData: Record<string, string | number>;
  /** Мок данные подключения для выполнения блока */
  authData?: Record<string, string | number>;
  /** Ключ подключения интеграции, которая будет использована для получения authData,
   * если connectionKey указан, то заданные authData не будут учитываться, а будут получены
   * из подключения
   */
  connectionKey?: string;
};

export type DebuggingBlocksConfig = Partial<{
  [blockKey: string]: DebuggingBlockConfig;
}>;

export type DebuggingConnectionConfig = {
  authData?: Record<string, string | number>;
};

export type DebuggingConnectionsConfig = Partial<{
  [connectionKey: string]: DebuggingConnectionConfig;
}>;

export type CommonIntegrationAuthData = GlobalAuthData & {
  [key: string]: any;
};

export type DebuggingConfig = {
  /** Количество запусков в серии, максимальное значение 100_000 выполнений
   *
   * @default 3
   */
  seriesIterations?: number;
  commonAuthData?: CommonIntegrationAuthData;
  /** Настройка мок данных для отладки блоков */
  blocks: DebuggingBlocksConfig;
  /** Настройка мок данных для отладки подключений */
  connections?: DebuggingConnectionsConfig;
};
