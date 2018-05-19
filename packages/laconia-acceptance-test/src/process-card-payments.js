const { invoke } = require("laconia-core");
const { laconiaBatch, dynamoDb } = require("laconia-batch");

module.exports.handler = laconiaBatch(
  _ =>
    dynamoDb({
      operation: "SCAN",
      dynamoDbParams: {
        TableName: process.env["ORDER_TABLE_NAME"]
      }
    }),
  { itemsPerSecond: 2 }
).on("item", async ({ env }, item) =>
  invoke(env.CAPTURE_CARD_PAYMENT_FUNCTION_NAME).fireAndForget(
    item.paymentReference
  )
);
