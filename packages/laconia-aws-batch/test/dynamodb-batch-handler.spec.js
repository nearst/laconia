/* eslint-env jest */

const AWSMock = require("aws-sdk-mock");
const dynamodbBatchHandler = require("../src/dynamodb-batch-handler");
const { sharedBehaviour } = require("./shared-batch-handler-spec");
const { yields } = require("laconia-test-helper");

describe("dynamodb batch handler", () => {
  let documentClient;

  beforeEach(() => {
    documentClient = {
      scan: jest.fn().mockImplementation(
        yields({
          Items: [{ Artist: "Foo" }, { Artist: "Bar" }, { Artist: "Fiz" }]
        })
      )
    };
    AWSMock.mock("DynamoDB.DocumentClient", "scan", documentClient.scan);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  sharedBehaviour(testOptions => {
    return dynamodbBatchHandler("SCAN", { TableName: "Music" }, testOptions);
  });
});
