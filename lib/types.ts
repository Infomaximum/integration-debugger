export type DebuggingBlockConfig = {
  inputData: Record<string, string | number>;
  authData?: Record<string, string | number>;
  connectionKey?: string;
};

export type DebuggingBlocksConfig = Partial<{
  [blockKey: string]: DebuggingBlockConfig;
}>;

export type DebuggingConfig = {
  blocks: DebuggingBlocksConfig;
};
