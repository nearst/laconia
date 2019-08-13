// @ts-check
const laconia = require("@laconia/core");
const kinesis = require("@laconia/adapter").kinesis();
const DynamoDbWebSocketServer = require("./DynamoDbWebSocketServer");

const app = async (orderEvents, { webSocketServer }) => {
  const acceptedEvents = orderEvents.filter(o => o.eventType === "accepted");
  if (acceptedEvents.length > 0) {
    return webSocketServer.broadcast({ message: "order accepted" });
  }
};

exports.handler = laconia(kinesis(app)).register(() => ({
  webSocketServer: new DynamoDbWebSocketServer(
    process.env.CONNECTION_TABLE_NAME,
    process.env.WEBSOCKET_ENDPOINT
  )
}));
