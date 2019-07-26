import { LaconiaFactory } from "@laconia/core";

declare namespace invoker {
  interface Invoker {}
  function envVarInstances(): LaconiaFactory<{ [key: string]: Invoker }>;
}

export = invoker;
