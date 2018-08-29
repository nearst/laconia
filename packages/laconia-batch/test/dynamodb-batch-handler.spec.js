const AWSMock = require("aws-sdk-mock");
const laconiaBatch = require("../src/laconiaBatch");
const dynamoDb = require("../src/dynamoDb");
const { sharedBehaviour } = require("./shared-batch-handler-spec");
const { yields } = require("@laconia/test-helper");

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

  sharedBehaviour(batchOptions => {
    return laconiaBatch(
      _ =>
        dynamoDb({
          operation: "SCAN",
          dynamoDbParams: { TableName: "Music" }
        }),
      batchOptions
    );
  });
});
