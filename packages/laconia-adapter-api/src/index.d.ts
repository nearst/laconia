import { LaconiaContext } from "@laconia/core";
import { apigateway as eventApiGateway } from "@laconia/event";

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

declare interface ErrorResponse {
  body?: any;
  headers?: eventApiGateway.ApiGatewayOutputHeaders;
  statusCode?: number;
}

declare interface ErrorMappings {
  [errorNameRegex: string]: (error: Error) => ErrorResponse;
}

declare namespace apigateway {
  interface AdapterFactoryOptions {
    inputType?: "params";
    responseStatusCode?: number;
    errorMappings?: ErrorMappings;
  }

  function apigateway(options?: AdapterFactoryOptions): AdapterFactory<any>;
}

export = apigateway;
