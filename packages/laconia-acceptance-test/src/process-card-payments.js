const { instances } = require("laconia-invoke");
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
)
  .register(instances)
  .on("item", ({ captureCardPayment }, item) =>
    captureCardPayment.fireAndForget({
      paymentReference: item.paymentReference
    })
  );
