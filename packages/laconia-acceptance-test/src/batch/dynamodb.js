const { dynamoDbBatchHandler } = require("laconia-batch");
const tracker = require("laconia-test-helper").tracker("batch-dynamoDb");

let lambdaContext;
module.exports.handler = dynamoDbBatchHandler(
  "SCAN",
  { TableName: process.env["TABLE_NAME"] },
  { itemsPerSecond: 2 }
)
  .on("start", (event, context) => {
    lambdaContext = context;
  })
  .on("item", item => {
    console.log(item);
    return tracker.tick({
      context: lambdaContext,
      item
    });
  });
