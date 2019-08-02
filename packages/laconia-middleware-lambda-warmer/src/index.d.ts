import { LaconiaHandler } from "@laconia/core";

declare function middlewareLambdaWarmer(next: LaconiaHandler): LaconiaHandler;

export = middlewareLambdaWarmer;
