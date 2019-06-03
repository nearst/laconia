const laconia = require("@laconia/core");
const adapterApi = require("@laconia/adapter-api");
const WebSocketClient = require("./WebSocketClient");

const instances = ({ event, env }) => ({
  wsClient: new WebSocketClient(
    env.WEBSOCKET_ENDPOINT,
    event.requestContext.connectionId
  )
});

const app = async (messageBody, { wsClient }) => {
  if (messageBody.message === "order accepted") {
    return wsClient.send({ message: "thank you for your order" });
  }
};

const webSocket = adapterApi.webSocket();

exports.handler = laconia(webSocket(app)).register(instances);
