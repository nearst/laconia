const AWS = require("aws-sdk");

module.exports = class KinesisOrderStream {
  constructor(streamName) {
    this.streamName = streamName;
  }

  send(order) {
    const kinesis = new AWS.Kinesis();

    return kinesis
      .putRecord({
        Data: JSON.stringify(order),
        PartitionKey: order.orderId,
        StreamName: process.env.ORDER_STREAM_NAME
      })
      .promise();
  }
};
