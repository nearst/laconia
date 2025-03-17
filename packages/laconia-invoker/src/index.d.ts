import { LaconiaContext, LaconiaFactory } from '@laconia/core';

declare namespace invoker {
  type RequestPayload = object | string | Buffer;
  type ResponsePayload = object | string | Buffer;
  interface Invoker {
    requestResponse(payload?: RequestPayload): Promise<ResponsePayload>;
    fireAndForget(payload?: RequestPayload): Promise<void>;
  }
  type Invokers = Record<string, Invoker>;
  function envVarInstances(): LaconiaFactory<LaconiaContext, Invokers>;
}

export = invoker;
