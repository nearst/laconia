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

type BatchEventListener = (laconiaContext: LaconiaContext) => void;
type ItemEventListener = (laconiaContext: LaconiaContext, item: any) => void;
type StopEventListener = (laconiaContext: LaconiaContext, cursor: any) => void;

interface LaconiaBatchHandler extends LaconiaHandler {
  on(
    eventName: "start" | "end",
    eventListener: BatchEventListener
  ): LaconiaBatchHandler;
  on(eventName: "item", eventListener: ItemEventListener): LaconiaBatchHandler;
  on(eventName: "stop", eventListener: StopEventListener): LaconiaBatchHandler;
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
