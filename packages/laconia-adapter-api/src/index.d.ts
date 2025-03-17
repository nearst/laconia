import { AdapterFactory } from "@laconia/core";
import { apigateway as eventApiGateway } from "@laconia/event";

declare interface ErrorResponse {
  body?: any;
  headers?: eventApiGateway.ApiGatewayOutputHeaders;
  statusCode?: number;
}

declare interface ErrorMapping<Err> {
  (error: Err): ErrorResponse;
}

declare interface ErrorMappings<Err> {
  [errorNameRegex: string]: ErrorMapping<Err>;
}

declare interface ErrorMappingsMap extends Map<string, ErrorResponse> {}

declare namespace apigateway {
  interface AdapterFactoryOptions<Err> {
    inputType?: "params" | "body";
    responseStatusCode?: number;
    includeInputHeaders?: boolean;
    errorMappings?: ErrorMappings<Err> | Map<string, ErrorMapping<Err>>;
    responseAdditionalHeaders?: eventApiGateway.ApiGatewayOutputHeaders;
  }

  function apigateway<Err extends Error>(options?: AdapterFactoryOptions<Err>): AdapterFactory;
  function webSocket(): AdapterFactory;
}

export = apigateway;
