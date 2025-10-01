const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

module.exports = class MusicRepository {
  constructor(dynamodb, documentClient) {
    this.dynamodb = dynamodb;
    this.documentClient = documentClient;
  }

  createTable() {
    const params = {
      AttributeDefinitions: [
        {
          AttributeName: "Artist",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "Artist",
          KeyType: "HASH"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: "Music"
    };

    return this.dynamodb.send(new CreateTableCommand(params));
  }

  save(music) {
    const params = {
      Item: music,
      TableName: "Music"
    };
    return this.documentClient.send(new PutCommand(params));
  }

  async scan(limit) {
    let params = { TableName: "Music" };
    if (limit) {
      params = { ...params, Limit: limit };
    }

    const data = await this.documentClient.send(new ScanCommand(params));
    return data.Items;
  }
};
