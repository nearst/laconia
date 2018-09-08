const invoker = require("@laconia/invoker");
const laconiaBatch = require("@laconia/batch");

module.exports.handler = laconiaBatch(
  _ =>
    laconiaBatch.dynamoDb({
      operation: "SCAN",
      dynamoDbParams: {
        TableName: process.env["ORDER_TABLE_NAME"]
      }
    }),
  { itemsPerSecond: 2 }
)
  .register(invoker.envVarInstances())
  .on("item", ({ captureCardPayment }, item) =>
    captureCardPayment.fireAndForget({
      paymentReference: item.paymentReference
    })
  );
