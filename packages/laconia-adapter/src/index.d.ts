import { LaconiaContext } from "@laconia/core";

declare type S3AdapterFactoryOptions = {
  inputType?: "object" | "stream";
};

declare interface Adaptee<Output> {
  (...args: any[]): Output;
}

declare interface S3Adapter<Output> {
  (s3Event: any, laconiaContext: LaconiaContext): Output;
}

declare namespace adapter {
  interface S3AdapterFactory {
    <Output>(app: Adaptee<Output>): S3Adapter<Output>;
  }
  function s3(options?: S3AdapterFactoryOptions): S3AdapterFactory;
}

export = adapter;
