/* eslint-env jest */
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const DynamoDbItemReader = require("../src/DynamoDbItemReader");
const { yields } = require("laconia-test-helper");

describe("DynamoDb Item Reader", () => {
  let documentClient;
  const dynamoDbParams = { Bucket: "bucket", Key: "key" };

  beforeEach(() => {
    documentClient = {
      query: jest.fn(),
      scan: jest.fn()
    };
    AWSMock.mock("DynamoDB.DocumentClient", "query", documentClient.query);
    AWSMock.mock("DynamoDB.DocumentClient", "scan", documentClient.scan);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("queries DynamoDb when QUERY operation is used", async () => {
    documentClient.query.mockImplementation(yields({ Items: [] }));
    documentClient.scan.mockImplementation(yields({ Items: [] }));
    const reader = new DynamoDbItemReader(
      "QUERY",
      new AWS.DynamoDB.DocumentClient(),
      dynamoDbParams
    );
    await reader.next();

    expect(documentClient.scan).not.toHaveBeenCalled();
    expect(documentClient.query).toHaveBeenCalled();
  });

  it("scans DynamoDb when SCAN operation is used");
  it("throws error when operation is not supported");
  it("generates next object");
  it("should use the parameters specified for DynamoDb operation");

  describe("when multiple items are returned", () => {
    it("generates nexts object with the correct content");
    it("should cache result");
  });

  describe("when start reading in the middle", () => {
    it("sets ExclusiveStartKey based on the parameter set");
    it("should cache result");
  });
});
