import { AdapterFactory } from "@laconia/core";

declare type S3AdapterFactoryOptions = {
  inputType?: "object" | "stream";
};

declare namespace adapter {
  function s3(options?: S3AdapterFactoryOptions): AdapterFactory<any>;
  function kinesis(): AdapterFactory<any[]>;
  function dynamodb(): AdapterFactory<any[]>;
  function sns(): AdapterFactory<any>;
  function sqs(): AdapterFactory<any[]>;
}

export = adapter;
