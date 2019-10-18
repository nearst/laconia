import { Handler } from "aws-lambda";

declare interface middlewareLambdaWarmer {
  (next: Handler): Handler;
}
declare function createLambdaWarmerMiddleware(): middlewareLambdaWarmer;

export = createLambdaWarmerMiddleware;
