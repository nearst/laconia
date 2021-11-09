import { LaconiaContext, LaconiaFactory } from '@laconia/core';

declare namespace config {
  function envVarInstances(): LaconiaFactory<LaconiaContext, Record<string, any>>;
}

export = config;
