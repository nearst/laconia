import { Handler, Context } from "aws-lambda";

declare namespace laconia {
  interface FactoryCacheOptions {
    enabled?: boolean;
    maxAge?: number;
  }

  interface FactoryOptions {
    cache?: FactoryCacheOptions;
  }

  interface LaconiaContext {
    [key: string]: any;
    event?: any;
    context?: Context;
  }

  interface LaconiaFactory<Dependencies = any> {
    (laconiaContext: LaconiaContext): Promise<Dependencies> | Dependencies;
  }

  interface LaconiaHandler extends Handler {
    register(
      factory: LaconiaFactory | LaconiaFactory[],
      options?: FactoryOptions
    ): LaconiaHandler;
    register(
      name: string,
      factory: LaconiaFactory,
      options?: FactoryOptions
    ): LaconiaHandler;
  }

  interface Adaptee<Input, Output> {
    (input: Input, laconiaContext: any): Output;
  }

  interface Adapter<Output> {
    (event: any, laconiaContext: laconia.LaconiaContext): Output;
  }

  interface AdapterFactory<Input> {
    <Output>(app: Adaptee<Input, Output>): Adapter<Output>;
  }
}

declare function laconia(app: Function): laconia.LaconiaHandler;

export = laconia;
