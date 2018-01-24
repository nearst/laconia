/* eslint-env jest */

const DynamoDbLocal = require("dynamodb-local");

const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const DynamoDbMusicRepository = require("./DynamoDbMusicRepository");
const { dynamoDbBatchHandler, SCAN, QUERY } = require("../src/index");

describe("dynamodb batch process", () => {
  const dynamoLocalPort = 8000;
  const dynamoDbOptions = {
    region: "eu-west-1",
    endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`)
  };
  let invokeMock, itemProcessor, event, context, callback;

  beforeAll(() => {
    jest.setTimeout(5000);
    return DynamoDbLocal.launch(dynamoLocalPort, null, ["-sharedDb"]);
  });

  beforeAll(async () => {
    const musicRepository = new DynamoDbMusicRepository(
      new AWS.DynamoDB(dynamoDbOptions),
      new AWS.DynamoDB.DocumentClient(dynamoDbOptions)
    );

    await musicRepository.createTable();
    await musicRepository.save({ Artist: "Foo" });
    await musicRepository.save({ Artist: "Bar" });
    await musicRepository.save({ Artist: "Fiz" });
  });

  beforeEach(() => {
    invokeMock = jest.fn();
    AWSMock.mock("Lambda", "invoke", invokeMock);

    itemProcessor = jest.fn();
    event = {};
    context = { functionName: "blah", getRemainingTimeInMillis: () => 100000 };
    callback = jest.fn();
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("should process all records in a Table with scan", async () => {
    await dynamoDbBatchHandler(SCAN, { TableName: "Music" }, itemProcessor, {
      documentClient: new AWS.DynamoDB.DocumentClient(dynamoDbOptions)
    })(event, context, callback);

    expect(itemProcessor).toHaveBeenCalledTimes(3);
    expect(itemProcessor).toHaveBeenCalledWith(
      { Artist: "Foo" },
      event,
      context
    );
    expect(itemProcessor).toHaveBeenCalledWith(
      { Artist: "Bar" },
      event,
      context
    );
    expect(itemProcessor).toHaveBeenCalledWith(
      { Artist: "Fiz" },
      event,
      context
    );
  });

  describe("when time is up", () => {
    beforeEach(async () => {
      context.getRemainingTimeInMillis = () => 5000;
      await await dynamoDbBatchHandler(
        SCAN,
        { TableName: "Music" },
        itemProcessor,
        { documentClient: new AWS.DynamoDB.DocumentClient(dynamoDbOptions) }
      )(event, context, callback);
    });

    it("should stop processing when time is up", async () => {
      expect(itemProcessor).toHaveBeenCalledTimes(1);
    });

    it("should recurse when time is up", async () => {
      expect(invokeMock).toBeCalledWith(
        expect.objectContaining({
          FunctionName: context.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify({
            cursor: { lastEvaluatedKey: { Artist: "Fiz" } }
          })
        }),
        expect.any(Function)
      );
    });
  });

  describe("when recursing", () => {
    // pass cursor in
  });

  it("should forward event during recursion");

  it("should support query", async () => {
    await dynamoDbBatchHandler(
      QUERY,
      {
        ExpressionAttributeValues: {
          ":v1": "Fiz"
        },
        KeyConditionExpression: "Artist = :v1",
        TableName: "Music"
      },
      itemProcessor,
      { documentClient: new AWS.DynamoDB.DocumentClient(dynamoDbOptions) }
    )(event, context, callback);

    expect(itemProcessor).toHaveBeenCalledTimes(1);
    expect(itemProcessor).toHaveBeenCalledWith(
      { Artist: "Fiz" },
      event,
      context
    );
  });

  it("should be able to stop recursing!");

  it(
    "CachedDynamoDbItemReader should not use Limit: 1 or should we return an array and process it all? Then setting Limit is becoming the user responsibility"
  );

  it("should not return unefined item when lastEvaluatedKey is not empty");

  it("mock invoke to call batchProcessor and finish the recursion!");

  afterAll(() => {
    return DynamoDbLocal.stop(dynamoLocalPort);
  });
});
