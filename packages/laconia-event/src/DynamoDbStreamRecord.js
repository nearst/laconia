const AWS = require("aws-sdk");

module.exports = class DynamoDbStreamRecord {
  constructor(data) {
    this.data = data;
  }

  get jsonNewImage() {
    return AWS.DynamoDB.Converter.unmarshall(this.newImage);
  }

  get newImage() {
    return this.data.NewImage;
  }

  static fromRaw(record) {
    return new DynamoDbStreamRecord(record.dynamodb);
  }
};
