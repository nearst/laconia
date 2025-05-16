import {
  LaconiaHandler,
  LaconiaFactory,
  FactoryOptions,
  LaconiaContext
} from "@laconia/core";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

declare type LaconiaBatchOptions = {
  itemsPerSecond?: number;
  timeNeededToRecurseInMillis?: number;
};

declare type DynamoDbReaderOptions = {
  operation: "SCAN" | "QUERY";
  dynamoDbParams: any;
  documentClient?: DynamoDBDocumentClient;
};

declare type S3ReaderOptions = {
  path: string;
  s3Params: {
    Bucket: string;
    Key: string;
    [key: string]: any;
  };
  s3?: S3Client;
};

declare type Cursor = {
  index?: number;
  lastEvaluatedKey?: any;
  exclusiveStartKey?: any;
  [key: string]: any;
};

declare type BatchItem = {
  item: any;
  cursor: Cursor;
  finished: boolean;
};

declare interface ItemReader {
  next(cursor?: Cursor): Promise<BatchItem>;
}

declare type ItemReaderFactory = (laconiaContext: LaconiaContext) => ItemReader;

declare namespace laconiaBatch {
  function dynamoDb(options: DynamoDbReaderOptions): ItemReader;
  function s3(options: S3ReaderOptions): ItemReader;
}

type BatchEventListener = (
  laconiaContext: LaconiaContext
) => void | Promise<void>;
type ItemEventListener = (
  laconiaContext: LaconiaContext,
  item: any
) => void | Promise<void>;
type StopEventListener = (
  laconiaContext: LaconiaContext,
  cursor: Cursor
) => void | Promise<void>;

interface LaconiaBatchHandler extends LaconiaHandler {
  on(eventName: "start" | "end", eventListener: BatchEventListener): this;
  on(eventName: "item", eventListener: ItemEventListener): this;
  on(eventName: "stop", eventListener: StopEventListener): this;
}

declare function laconiaBatch(
  itemReaderFactory: ItemReaderFactory,
  options?: LaconiaBatchOptions
): LaconiaBatchHandler;

export = laconiaBatch;
