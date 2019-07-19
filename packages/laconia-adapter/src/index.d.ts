import { LaconiaContext } from "@laconia/core";

declare type S3AdapterFactoryOptions = {
  inputType?: "object" | "stream";
};

declare interface Adaptee<Input, Output> {
  (input: Input, laconiaContext: any): Output;
}

declare interface Adapter<Output> {
  (event: any, laconiaContext: LaconiaContext): Output;
}

declare interface AdapterFactory<Input> {
  <Output>(app: Adaptee<Input, Output>): Adapter<Output>;
}

declare namespace adapter {
  function s3(options?: S3AdapterFactoryOptions): AdapterFactory<any>;
  function kinesis(): AdapterFactory<any[]>;
  function sns(): AdapterFactory<any>;
  function sqs(): AdapterFactory<any[]>;
}

export = adapter;
