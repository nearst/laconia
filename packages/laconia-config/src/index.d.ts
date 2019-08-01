import { LaconiaFactory } from "@laconia/core";

declare namespace config {
  function envVarInstaces(): LaconiaFactory<any>;
}

export = config;
