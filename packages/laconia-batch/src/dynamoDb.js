const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const DynamoDbItemReader = require("./DynamoDbItemReader");

module.exports = ({
  operation,
  dynamoDbParams,
  documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
}) => new DynamoDbItemReader(operation, documentClient, dynamoDbParams);
