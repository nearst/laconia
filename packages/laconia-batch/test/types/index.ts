import laconiaBatch from "../../src/index";

laconiaBatch(() => laconiaBatch.dynamoDb());

// Customise batch options
// exports.handler = laconiaBatch(_ => laconiaBatch.dynamoDb(), {
//   itemsPerSecond: 2,
//   timeNeededToRecurseInMillis: 10000
// });
