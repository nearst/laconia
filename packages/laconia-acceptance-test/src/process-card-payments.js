const invoke = require("@laconia/invoke");
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
  .register(invoke.envVarInstances)
  .on("item", ({ captureCardPayment }, item) =>
    captureCardPayment.fireAndForget({
      paymentReference: item.paymentReference
    })
  );
