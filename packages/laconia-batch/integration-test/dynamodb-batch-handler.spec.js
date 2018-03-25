const DynamoDbLocal = require("dynamodb-local");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const DynamoDbMusicRepository = require("./DynamoDbMusicRepository");
const { sharedBehaviour } = require("../test/shared-batch-handler-spec");
const dynamoDbBatchHandler = require("../src/dynamodb-batch-handler");

AWS.config.credentials = new AWS.Credentials("fake", "fake", "fake");

describe("dynamodb batch handler", () => {
  const dynamoLocalPort = 8000;
  const dynamoDbOptions = {
    region: "eu-west-1",
    endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`)
  };
  let itemListener, event, context, callback, documentClient;

  beforeAll(() => {
    jest.setTimeout(60000);
    return DynamoDbLocal.launch(dynamoLocalPort, null, ["-sharedDb"]);
  });

  afterAll(() => {
    return DynamoDbLocal.stop(dynamoLocalPort);
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
    itemListener = jest.fn();
    event = {};
    context = { functionName: "blah", getRemainingTimeInMillis: () => 100000 };
    callback = jest.fn();
    documentClient = new AWS.DynamoDB.DocumentClient(dynamoDbOptions);
  });

  sharedBehaviour(batchOptions => {
    return dynamoDbBatchHandler({
      readerOptions: {
        operation: "SCAN",
        dynamoDbParams: { TableName: "Music" },
        documentClient
      },
      batchOptions
    });
  });

  it("should support query operation", async () => {
    await dynamoDbBatchHandler({
      readerOptions: {
        operation: "QUERY",
        dynamoDbParams: {
          ExpressionAttributeValues: {
            ":v1": "Fiz"
          },
          KeyConditionExpression: "Artist = :v1",
          TableName: "Music"
        },
        documentClient
      }
    }).on("item", itemListener)(event, context, callback);

    expect(itemListener).toHaveBeenCalledTimes(1);
    expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
      Artist: "Fiz"
    });
  });

  it("should be able to process all items when Limit is set to 1", async () => {
    await dynamoDbBatchHandler({
      readerOptions: {
        operation: "SCAN",
        dynamoDbParams: {
          TableName: "Music",
          Limit: 1
        },
        documentClient
      }
    }).on("item", itemListener)(event, context, callback);

    expect(itemListener).toHaveBeenCalledTimes(3);
    expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
      Artist: "Foo"
    });
    expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
      Artist: "Bar"
    });
    expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
      Artist: "Fiz"
    });
  });

  it("should be able to process items when filtered", async () => {
    await dynamoDbBatchHandler({
      readerOptions: {
        operation: "SCAN",
        dynamoDbParams: {
          TableName: "Music",
          Limit: 1,
          ExpressionAttributeValues: {
            ":a": "Bar"
          },
          FilterExpression: "Artist = :a"
        },
        documentClient
      }
    }).on("item", itemListener)(event, context, callback);

    expect(itemListener).toHaveBeenCalledTimes(1);
    expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
      Artist: "Bar"
    });
  });

  describe("when completing recursion", () => {
    let invokeMock;

    beforeEach(() => {
      invokeMock = jest.fn();
      AWSMock.mock("Lambda", "invoke", invokeMock);
    });

    afterEach(() => {
      AWSMock.restore();
    });

    it("should process all items when filtered and limited", async done => {
      context.getRemainingTimeInMillis = () => 5000;
      const handler = dynamoDbBatchHandler({
        readerOptions: {
          operation: "SCAN",
          dynamoDbParams: {
            TableName: "Music",
            ExpressionAttributeValues: {
              ":a": "Bar"
            },
            Limit: 1,
            FilterExpression: "Artist = :a"
          },
          documentClient
        }
      })
        .on("item", itemListener)
        .on("end", () => {
          expect(invokeMock).toHaveBeenCalledTimes(3);
          expect(itemListener).toHaveBeenCalledTimes(1);
          expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
            Artist: "Bar"
          });
          done();
        });

      invokeMock.mockImplementation(event =>
        handler(JSON.parse(event.Payload), context, callback)
      );

      handler(event, context, callback);
    });
  });
});
