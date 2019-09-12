import { Handler, Context } from "aws-lambda";

declare namespace laconia {
  type FactoryCacheOptions = {
    enabled?: boolean;
    maxAge?: number;
  };

  type FactoryOptions = { cache?: FactoryCacheOptions };

  type LaconiaContext = {
    [key: string]: any;
    event?: any;
    context?: Context;
  };

  type LaconiaFactory<Dependencies = any> = (
    laconiaContext: LaconiaContext
  ) => Promise<Dependencies> | Dependencies;

  interface LaconiaHandler extends Handler {
    register(
      factory: string | LaconiaFactory | LaconiaFactory[],
      optionsOrFactory?: LaconiaFactory | FactoryOptions,
      options?: FactoryOptions
    ): LaconiaHandler;
  }
}

declare function laconia(app: Function): laconia.LaconiaHandler;

export = laconia;
