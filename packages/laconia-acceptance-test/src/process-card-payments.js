const { invoke } = require("laconia-core");
const { laconiaBatch, dynamoDb } = require("laconia-batch");

const instances = ({ env }) => ({
  captureCardPayment: invoke(env.CAPTURE_CARD_PAYMENT_FUNCTION_NAME)
});

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
