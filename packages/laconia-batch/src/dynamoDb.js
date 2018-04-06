const AWS = require("aws-sdk");
const DynamoDbItemReader = require("./DynamoDbItemReader");

module.exports = ({
  operation,
  dynamoDbParams,
  documentClient = new AWS.DynamoDB.DocumentClient()
}) => new DynamoDbItemReader(operation, documentClient, dynamoDbParams);
