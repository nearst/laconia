const DynamoDbLocal = require("dynamodb-local");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const DynamoDbMusicRepository = require("./DynamoDbMusicRepository");
const { sharedBehaviour } = require("../test/shared-batch-handler-spec");
const dynamoDb = require("../src/dynamoDb");
const laconiaBatch = require("../src/laconiaBatch");

AWSMock.setSDKInstance(AWS);
AWS.config.credentials = new AWS.Credentials("fake", "fake", "fake");

describe("dynamodb batch handler", () => {
  const dynamoLocalPort = 8000;
  const dynamoDbOptions = {
    region: "eu-west-1",
    endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`)
  };
  let itemListener, event, context, callback, documentClient;

  beforeAll(() => {
    return DynamoDbLocal.launch(dynamoLocalPort, null, ["-sharedDb"]);
  }, 60000);

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
    return laconiaBatch(
      _ =>
        dynamoDb({
          operation: "SCAN",
          dynamoDbParams: { TableName: "Music" },
          documentClient
        }),
      batchOptions
    );
  });

  it("should support query operation", async () => {
    await laconiaBatch(_ =>
      dynamoDb({
        operation: "QUERY",
        dynamoDbParams: {
          ExpressionAttributeValues: {
            ":v1": "Fiz"
          },
          KeyConditionExpression: "Artist = :v1",
          TableName: "Music"
        },
        documentClient
      })
    ).on("item", itemListener)(event, context, callback);

    expect(itemListener).toHaveBeenCalledTimes(1);
    expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
      Artist: "Fiz"
    });
  });

  it("should be able to process all items when Limit is set to 1", async () => {
    await laconiaBatch(_ =>
      dynamoDb({
        operation: "SCAN",
        dynamoDbParams: {
          TableName: "Music",
          Limit: 1
        },
        documentClient
      })
    ).on("item", itemListener)(event, context, callback);

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
    await laconiaBatch(_ =>
      dynamoDb({
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
      })
    ).on("item", itemListener)(event, context, callback);

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
      const handler = laconiaBatch(_ =>
        dynamoDb({
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
        })
      )
        .register(() => ({ $lambda: new AWS.Lambda() }))
        .on("item", itemListener)
        .on("end", () => {
          expect(invokeMock).toHaveBeenCalledTimes(3);
          expect(itemListener).toHaveBeenCalledTimes(1);
          expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
            Artist: "Bar"
          });
          done();
        });

      invokeMock.mockImplementation((event, callback) => {
        handler(JSON.parse(event.Payload), context, callback);
        callback(null, {
          FunctionError: undefined,
          StatusCode: 202,
          Payload: '{"value":"response"}'
        });
      });

      handler(event, context, callback);
    });
  });
});
