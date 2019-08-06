import { Handler } from "aws-lambda";

declare function middlewareLambdaWarmer(next: Handler): Handler;

export = middlewareLambdaWarmer;
