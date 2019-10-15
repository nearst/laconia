import { Handler } from "aws-lambda";

declare interface middlewareServerlessPluginWarmup {
  (next: Handler): Handler;
}

declare function createLambdaWarmerMiddleware(): middlewareServerlessPluginWarmup;

export = createLambdaWarmerMiddleware;
