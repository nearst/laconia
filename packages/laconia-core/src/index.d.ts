export type FactoryCacheOptions = {
  enabled?: boolean;
  maxAge?: number;
};

export type FactoryOptions = { cache?: FactoryCacheOptions };

export type LaconiaContext = {
  [key: string]: any;
};

export type LaconiaFactory<Dependencies = any> = (
  laconiaContext: LaconiaContext
) => Promise<Dependencies> | Dependencies;

export interface LaconiaHandler {
  register(
    factory: LaconiaFactory | LaconiaFactory[],
    options?: FactoryOptions
  ): LaconiaHandler;
  postProcessor(postProcessor: any): LaconiaHandler;
  (event: any, context: any, callback: any): any;
}

export function laconia(app: Function): LaconiaHandler;

export default laconia;
