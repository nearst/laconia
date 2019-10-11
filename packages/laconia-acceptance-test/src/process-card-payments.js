// @ts-check
const invoker = require("@laconia/invoker");
const xray = require("@laconia/xray");
const laconiaBatch = require("@laconia/batch");

exports.handler = laconiaBatch(
  _ =>
    laconiaBatch.dynamoDb({
      operation: "SCAN",
      dynamoDbParams: {
        TableName: process.env.ORDER_TABLE_NAME
      }
    }),
  { itemsPerSecond: 2 }
)
  .register(invoker.envVarInstances())
  .postProcessor(xray.postProcessor())
  .on("item", ({ captureCardPayment }, item) =>
    captureCardPayment.fireAndForget({
      paymentReference: item.paymentReference
    })
  );
