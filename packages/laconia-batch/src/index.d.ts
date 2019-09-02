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

declare type Cursor = any;

declare type BatchItem = {
  item: any;
  cursor: Cursor;
  finished: boolean;
};

declare interface ItemReader {
  next(cursor: Cursor): Promise<BatchItem>;
}

declare type ItemReaderFactory = (laconiaContext: LaconiaContext) => ItemReader;

declare namespace laconiaBatch {
  function dynamoDb(options: DynamoDbReaderOptions): ItemReader;
  function s3(options: S3ReaderOptions): ItemReader;
}

type BatchEventListener = (laconiaContext: LaconiaContext) => void;
type ItemEventListener = (laconiaContext: LaconiaContext, item: any) => void;
type StopEventListener = (
  laconiaContext: LaconiaContext,
  cursor: Cursor
) => void;

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
  itemReaderFactory: ItemReaderFactory,
  options?: LaconiaBatchOptions
): LaconiaBatchHandler;

export = laconiaBatch;
