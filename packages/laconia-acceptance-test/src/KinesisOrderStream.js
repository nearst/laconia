const AWS = require("aws-sdk");

module.exports = class KinesisOrderStream {
  constructor(streamName) {
    this.streamName = streamName;
  }

  send(orderEvent) {
    const kinesis = new AWS.Kinesis();

    return kinesis
      .putRecord({
        Data: JSON.stringify(orderEvent),
        PartitionKey: orderEvent.orderId,
        StreamName: process.env.ORDER_STREAM_NAME
      })
      .promise();
  }
};
