const { dynamodb } = require("@laconia/event");

module.exports = class DynamoDbStreamJsonInputConverter {
  convert(event) {
    return dynamodb(event).records.map(r => r.parseRecord);
  }
};
