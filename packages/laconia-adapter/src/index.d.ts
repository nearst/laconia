declare type S3AdapterOptions = {
  inputType?: "object" | "stream";
};

declare interface Adaptee<Output> {
  (...args: any[]): Output;
}

declare interface S3Adapter<Output = any> {
  (app: Adaptee<Output>): Output;
}

declare namespace index {
  function s3(options?: S3AdapterOptions): S3Adapter;
}

export = index;
