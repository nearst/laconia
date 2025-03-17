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

  interface LaconiaFactory<Context, Dependencies> {
    (laconiaContext: Context): Promise<Dependencies> | Dependencies;
  }

  interface PostProcessor<Context> {
    (laconiaContext: Context): void;
  }

  interface LaconiaHandler extends Handler {
    register<Context extends LaconiaContext, Dependencies>(
      factory: LaconiaFactory<Context, Dependencies> | LaconiaFactory<Context, Dependencies>[],
      options?: FactoryOptions
    ): this;
    register<Context extends LaconiaContext, Dependencies>(
      name: string,
      factory: LaconiaFactory<Context, Dependencies>,
      options?: FactoryOptions
    ): this;
    postProcessor<Context extends LaconiaContext>(postProcessor: PostProcessor<Context>): this;
  }

  interface App<Input, Context, Output> {
    (event: Input, laconiaContext: Context): Output;
  }

  interface AdapterFactory {
    <Input, Context extends LaconiaContext, Output>(app: App<Input, Context, Output>): App<Input, Context, Output>;
  }
}

declare function laconia<Input, Context extends laconia.LaconiaContext, Output>(app: laconia.App<Input, Context, Output>): laconia.LaconiaHandler;

export = laconia;
