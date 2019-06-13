const AWS = require("aws-sdk");

const ensureApiGatewayManagementApi = require("aws-apigatewaymanagementapi");

ensureApiGatewayManagementApi(AWS);

module.exports = class WebSocketClient {
  constructor(endpoint, connectionId) {
    this.client = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: endpoint
    });
    this.connectionId = connectionId;
  }

  send(message) {
    console.log("Sending to websocket client", this.connectionId, message);
    return this.client
      .postToConnection({
        ConnectionId: this.connectionId,
        Data: JSON.stringify(message)
      })
      .promise();
  }
};
