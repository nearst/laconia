// @ts-check
const laconia = require("@laconia/core");
const { res } = require("@laconia/event").apigateway;
const DynamoDbWebSocketServer = require("./DynamoDbWebSocketServer");

const app = async (connectionId, { webSocketServer }) => {
  return webSocketServer.addConnection(connectionId);
};

const adapter = app => async (event, laconiaContext) => {
  await app(event.requestContext.connectionId, laconiaContext);
  return res("success", 200);
};

exports.handler = laconia(adapter(app)).register(
  "webSocketServer",
  () => new DynamoDbWebSocketServer(process.env.CONNECTION_TABLE_NAME)
);
