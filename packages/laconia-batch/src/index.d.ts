import { LaconiaHandler } from "@laconia/core";

declare type LaconiaBatchOptions = {
  itemsPerSecond?: number;
  timeNeededToRecurseInMillis?: number;
};

declare namespace laconiaBatch {
  function dynamoDb(): any;
}

declare function laconiaBatch(
  app: Function,
  options: LaconiaBatchOptions
): LaconiaHandler;

export = laconiaBatch;
