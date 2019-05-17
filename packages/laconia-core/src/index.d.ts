declare type FactoryCacheOptions = {
  enabled?: boolean;
  maxAge?: number;
};

declare type FactoryOptions = { cache?: FactoryCacheOptions };

declare type LaconiaContext = {
  [key: string]: any;
};

declare type LaconiaFactory<Dependencies = any> = (
  laconiaContext: LaconiaContext
) => Promise<Dependencies> | Dependencies;

declare interface LaconiaHandler {
  register(
    factory: LaconiaFactory | LaconiaFactory[],
    options?: FactoryOptions
  ): LaconiaHandler;
  (event: any, context: any, callback: any): any;
}

declare function laconia(app: Function): LaconiaHandler;

export = laconia;
