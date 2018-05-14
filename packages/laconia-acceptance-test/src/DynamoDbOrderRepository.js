const AWS = require("aws-sdk");

module.exports = class DynamoDbOrderRepository {
  constructor(tableName) {
    this.documentClient = new AWS.DynamoDB();
  }
};
