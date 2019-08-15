import { LaconiaHandler } from "@laconia/core";

declare namespace laconiaBatch {
  function dynamoDb(): any;
}

declare function laconiaBatch(app: Function): LaconiaHandler;

export = laconiaBatch;
