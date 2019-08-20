import laconiaBatch from "../../src/index";

laconiaBatch(() => laconiaBatch.dynamoDb(), {
  itemsPerSecond: 2,
  timeNeededToRecurseInMillis: 10000
});
