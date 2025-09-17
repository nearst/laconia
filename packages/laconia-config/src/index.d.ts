import { LaconiaFactory } from "@laconia/core";

declare namespace config {
  function envVarInstances(): LaconiaFactory<Record<string, any>>;
}

export = config;
