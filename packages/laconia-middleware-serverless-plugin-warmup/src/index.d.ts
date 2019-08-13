import { Handler } from "aws-lambda";

declare function middlewareServerlessPluginWarmup(next: Handler): Handler;

export = middlewareServerlessPluginWarmup;
