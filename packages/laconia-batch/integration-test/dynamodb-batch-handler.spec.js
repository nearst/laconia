const DynamoDbLocal = require("dynamodb-local");
const { mockClient } = require("aws-sdk-client-mock");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const DynamoDbMusicRepository = require("./DynamoDbMusicRepository");
const { sharedBehaviour } = require("../test/shared-batch-handler-spec");
const dynamoDb = require("../src/dynamoDb");
const laconiaBatch = require("../src/laconiaBatch");
const delay = require("delay");
const net = require("net");
const { matchers, recordTimestamps } = require("@laconia/test-helper");
expect.extend(matchers);

jest.setTimeout(30000);

function isPortAvailable(host, port) {
  return new Promise(resolve => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(1000);
    socket.once("error", onError);
    socket.once("timeout", onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

async function waitForPortAvailable(
  host,
  port,
  timeoutMs = 15000,
  intervalMs = 200
) {
  console.log(`Waiting for ${host}:${port} to become available...`);
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const available = await isPortAvailable(host, port);
    if (available) {
      console.log(`Port ${port} is now available!`);

      await delay(500);
      return;
    }

    process.stdout.write(".");
    await delay(intervalMs);
  }

  throw new Error(`Timed out waiting for ${host}:${port} after ${timeoutMs}ms`);
}

describe("dynamodb batch handler", () => {
  const dynamoLocalPort = 8000;
  const dynamoLocalHost = "localhost";
  const lambdaMock = mockClient(LambdaClient);
  const dynamoDbOptions = {
    region: "local",
    endpoint: `http://${dynamoLocalHost}:${dynamoLocalPort}`,
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake"
    }
  };
  let itemListener, event, context, callback, documentClient;
  let child;

  beforeAll(async () => {
    const isInUse = await isPortAvailable(dynamoLocalHost, dynamoLocalPort);
    if (isInUse) {
      throw new Error(
        `Port ${dynamoLocalPort} is already in use. Make sure no other DynamoDB Local instance is running.`
      );
    }

    child = await DynamoDbLocal.launch(
      dynamoLocalPort,
      null,
      ["-sharedDb"],
      false,
      true
    );

    // Wait for DynamoDB Local to be ready
    await waitForPortAvailable(dynamoLocalHost, dynamoLocalPort);

    const dynamoDbClient = new DynamoDBClient(dynamoDbOptions);
    const docClient = DynamoDBDocumentClient.from(dynamoDbClient, {
      marshallOptions: { removeUndefinedValues: true }
    });

    const musicRepository = new DynamoDbMusicRepository(
      dynamoDbClient,
      docClient
    );

    await musicRepository.createTable();
    await musicRepository.save({ Artist: "Foo" });
    await musicRepository.save({ Artist: "Bar" });
    await musicRepository.save({ Artist: "Fiz" });
  });

  afterAll(async () => {
    await DynamoDbLocal.stopChild(child);

    // Verify the port is now closed
    const stillOpen = await isPortAvailable(dynamoLocalHost, dynamoLocalPort);
    if (stillOpen) {
      console.warn(
        `Warning: Port ${dynamoLocalPort} is still in use after test cleanup!`
      );
    } else {
      console.log(`Port ${dynamoLocalPort} successfully closed.`);
    }
  });

  beforeEach(() => {
    itemListener = jest.fn();
    event = {};
    context = { functionName: "blah", getRemainingTimeInMillis: () => 100000 };
    callback = jest.fn();

    const dynamoDbClient = new DynamoDBClient(dynamoDbOptions);
    documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

    lambdaMock.reset();
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
    beforeEach(() => {
      lambdaMock.reset();
    });

    it("should process all items when filtered and limited", async () => {
      context.getRemainingTimeInMillis = () => 5000;
      const handlerPromise = new Promise(resolve => {
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
          .register(() => ({ $lambda: new LambdaClient() }))
          .on("item", itemListener)
          .on("end", () => {
            resolve();
          });

        lambdaMock.on(InvokeCommand).callsFake(params => {
          handler(JSON.parse(params.Payload), context, callback);
          return {
            FunctionError: undefined,
            StatusCode: 202,
            Payload: Buffer.from(JSON.stringify({ value: "response" }))
          };
        });

        handler(event, context, callback);
      });

      await handlerPromise;

      expect(lambdaMock.calls().length).toEqual(3);
      expect(itemListener).toHaveBeenCalledTimes(1);
      expect(itemListener).toHaveBeenCalledWith(expect.anything(), {
        Artist: "Bar"
      });
    });

    it("waits for slow async operation before processing the next item", async () => {
      itemListener = jest.fn().mockImplementation(() => {
        recordTimestamps(itemListener)();
        return delay(100);
      });
      context.getRemainingTimeInMillis = () => 10000;

      const handler = laconiaBatch(
        _ =>
          dynamoDb({
            operation: "SCAN",
            dynamoDbParams: {
              TableName: "Music"
            },
            documentClient
          }),
        {}
      )
        .register(() => ({ $lambda: new LambdaClient() }))
        .on("item", itemListener);

      await handler(event, context, callback);

      expect(itemListener).toBeCalledWithGapBetween(50, 150);
      expect(itemListener).toHaveBeenCalledTimes(3);
      expect(lambdaMock.calls().length).toEqual(0);
    });
  });
});
