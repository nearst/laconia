declare namespace laconia {
  type FactoryCacheOptions = {
    enabled?: boolean;
    maxAge?: number;
  };

  type FactoryOptions = { cache?: FactoryCacheOptions };

  type LaconiaContext = {
    [key: string]: any;
  };

  type LaconiaFactory<Dependencies = any> = (
    laconiaContext: LaconiaContext
  ) => Promise<Dependencies> | Dependencies;

  interface LaconiaHandler {
    register(
      factory: LaconiaFactory | LaconiaFactory[],
      options?: FactoryOptions
    ): LaconiaHandler;
    (event: any, context: any, callback: any): any;
  }
}

declare function laconia(app: Function): laconia.LaconiaHandler;

export = laconia;
