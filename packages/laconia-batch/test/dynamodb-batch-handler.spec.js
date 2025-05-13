const { mockClient } = require("aws-sdk-client-mock");
const {
  DynamoDBDocumentClient,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");
const laconiaBatch = require("../src/laconiaBatch");
const dynamoDb = require("../src/dynamoDb");
const { sharedBehaviour } = require("./shared-batch-handler-spec");

describe("dynamodb batch handler", () => {
  let ddbMock;

  beforeEach(() => {
    ddbMock = mockClient(DynamoDBDocumentClient);

    ddbMock.on(ScanCommand).resolves({
      Items: [{ Artist: "Foo" }, { Artist: "Bar" }, { Artist: "Fiz" }]
    });
  });

  afterEach(() => {
    ddbMock.reset();
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
