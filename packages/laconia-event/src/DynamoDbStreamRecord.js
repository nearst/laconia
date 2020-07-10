require("aws-sdk/clients/dynamodb");
const converter = require("aws-sdk/lib/dynamodb/converter");

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

  get parseRecord() {
    return {
      eventName: this.eventName,
      StreamViewType: this.data.StreamViewType,
      Keys:
        this.data && this.data.Keys ? converter.unmarshall(this.data.Keys) : {},
      NewImage:
        this.data && this.data.NewImage
          ? converter.unmarshall(this.data.NewImage)
          : {},
      OldImage:
        this.data && this.data.OldImage
          ? converter.unmarshall(this.data.OldImage)
          : {}
    };
  }

  static fromRaw(record) {
    return new DynamoDbStreamRecord(record.dynamodb);
  }
};
