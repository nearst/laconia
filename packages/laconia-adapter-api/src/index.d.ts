import { LaconiaContext } from "@laconia/core";
import { apigateway as eventApiGateway } from "@laconia/event";

// TODO: This is copy pasted by @laconia/adapter, move to @laconia/core?
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

declare interface ErrorMapping {
  (error: Error): ErrorResponse;
}

declare interface ErrorMappings {
  [errorNameRegex: string]: ErrorMapping;
}

declare interface ErrorMappingsMap extends Map<string, ErrorResponse> {}

declare namespace apigateway {
  interface AdapterFactoryOptions {
    inputType?: "params";
    responseStatusCode?: number;
    errorMappings?: ErrorMappings | Map<string, ErrorMapping>;
  }

  function apigateway(options?: AdapterFactoryOptions): AdapterFactory<any>;
}

export = apigateway;
