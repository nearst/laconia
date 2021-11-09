import { AdapterFactory } from "@laconia/core";

declare type S3AdapterFactoryOptions = {
  inputType?: "object" | "text" | "stream";
};

declare namespace adapter {
  function s3(options?: S3AdapterFactoryOptions): AdapterFactory;
  function kinesis(): AdapterFactory;
  function dynamodb(): AdapterFactory;
  function sns(): AdapterFactory;
  function sqs(): AdapterFactory;
}

export = adapter;
