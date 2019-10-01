import { LaconiaContext } from "@laconia/core";

// TODO: This is copy pasted by @laconia/adapter
declare interface Adaptee<Input, Output> {
  (input: Input, laconiaContext: any): Output;
}

declare interface Adapter<Output> {
  (event: any, laconiaContext: LaconiaContext): Output;
}

declare interface AdapterFactory<Input> {
  <Output>(app: Adaptee<Input, Output>): Adapter<Output>;
}

declare namespace apigateway {
  interface AdapterFactoryOptions {
    inputType?: "params";
  }

  function apigateway(options?: AdapterFactoryOptions): AdapterFactory<any>;
}

export = apigateway;
