const { dynamodb } = require("@laconia/event");

module.exports = class DynamoDbStreamJsonInputConvertor {
  convert(event) {
    return dynamodb(event).records.map(r => r.jsonNewImage);
  }
};
