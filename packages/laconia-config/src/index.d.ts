import { LaconiaFactory } from "@laconia/core";

declare namespace config {
  function envVarInstances<Context>(): LaconiaFactory<
    Context,
    Record<string, any>
  >;
}

export = config;
