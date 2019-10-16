// @ts-check
const laconia = require("@laconia/core");
const adapterApi = require("@laconia/adapter-api");
const WebSocketClient = require("./WebSocketClient");

const instances = ({ event, env }) => ({
  wsClient: new WebSocketClient(
    env.WEBSOCKET_ENDPOINT,
    event.requestContext.connectionId
  )
});

const app = async (message, { wsClient }) => {
  if (message.body.message === "order received") {
    return wsClient.send({ message: "thank you for your order" });
  }
};

const webSocket = adapterApi.webSocket();

exports.handler = laconia(webSocket(app)).register(instances, {
  cache: { enabled: false }
});
