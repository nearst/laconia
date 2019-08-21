import { LaconiaHandler } from "@laconia/core";

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

declare function laconiaBatch(
  app: Function,
  options?: LaconiaBatchOptions
): LaconiaHandler;

export = laconiaBatch;
