require('aws-sdk/clients/dynamodb');
const converter = require('aws-sdk/lib/dynamodb/converter')

module.exports = class DynamoDbStreamRecord {
  constructor(data) {
    this.data = data;
  }

  get jsonNewImage() {
    return converter.unmarshall(this.newImage);
  }

  get newImage() {
    return this.data.NewImage;
  }

  static fromRaw(record) {
    return new DynamoDbStreamRecord(record.dynamodb);
  }
};
