import { LaconiaFactory } from "@laconia/core";

declare namespace config {
  function envVarInstances(): LaconiaFactory<any>;
}

export = config;
