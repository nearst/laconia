import {
  LaconiaHandler,
  LaconiaFactory,
  FactoryOptions,
  LaconiaContext
} from "@laconia/core";

declare type LaconiaBatchOptions = {
  itemsPerSecond?: number;
  timeNeededToRecurseInMillis?: number;
};

declare type DynamoDbReaderOptions = {
  operation: "SCAN" | "QUERY";
  dynamoDbParams: any;
  documentClient?: any;
};

declare type S3ReaderOptions = {
  path: string;
  s3Params: any;
  s3?: any;
};

declare namespace laconiaBatch {
  function dynamoDb(options: DynamoDbReaderOptions): any;
  function s3(options: S3ReaderOptions): any;
}

type StartEventListener = (laconiaContext: LaconiaContext) => void;

interface LaconiaBatchHandler extends LaconiaHandler {
  on(
    eventName: "start",
    eventListener: StartEventListener
  ): LaconiaBatchHandler;
  register(
    factory: LaconiaFactory | LaconiaFactory[],
    options?: FactoryOptions
  ): LaconiaBatchHandler;
}

declare function laconiaBatch(
  app: Function,
  options?: LaconiaBatchOptions
): LaconiaBatchHandler;

export = laconiaBatch;
