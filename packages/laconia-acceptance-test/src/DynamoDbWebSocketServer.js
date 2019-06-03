const AWS = require("aws-sdk");
const ensureApiGatewayManagementApi = require("aws-apigatewaymanagementapi");

ensureApiGatewayManagementApi(AWS);

module.exports = class DynamoDbWebSocketServer {
  constructor(connectionTableName, endpoint) {
    this.connectionTableName = connectionTableName;
    this.DDB = new AWS.DynamoDB();
    this.documentClient = new AWS.DynamoDB.DocumentClient();
    this.endpoint = endpoint;
  }

  addConnection(connectionId) {
    const putParams = {
      TableName: this.connectionTableName,
      Item: { connectionId }
    };

    return this.documentClient.put(putParams).promise();
  }

  removeConnection(connectionId) {
    const deleteParams = {
      TableName: this.connectionTableName,
      Key: { connectionId }
    };

    return this.documentClient.delete(deleteParams).promise();
  }

  async broadcast(message) {
    const client = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: this.endpoint
    });

    const data = await this.documentClient
      .scan({
        TableName: this.connectionTableName
      })
      .promise();

    return Promise.all(
      data.Items.map(item =>
        client
          .postToConnection({
            ConnectionId: item.connectionId,
            Data: JSON.stringify(message)
          })
          .promise()
      )
    );
  }
};
