const { unmarshall } = require("@aws-sdk/util-dynamodb");

module.exports = class DynamoDbStreamRecord {
  constructor(data) {
    this.data = data;
  }

  get jsonNewImage() {
    return unmarshall(this.newImage);
  }

  get newImage() {
    return this.data.NewImage;
  }

  static fromRaw(record) {
    return new DynamoDbStreamRecord(record.dynamodb);
  }
};
