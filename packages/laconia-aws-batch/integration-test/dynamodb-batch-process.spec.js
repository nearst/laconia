/* eslint-env jest */

const DynamoDbLocal = require("dynamodb-local");

const AWS = require("aws-sdk");
const DynamoDbMusicRepository = require("./DynamoDbMusicRepository");
const { BatchProcessor, DynamoDbItemReader } = require("../src/index");

describe("aws invoke", () => {
  const dynamoLocalPort = 8000;
  const dynamoDbOptions = {
    region: "eu-west-1",
    endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`)
  };

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

  it("should process all records in a Table with scan", async () => {
    const itemProcessor = jest.fn();
    const batchProcessor = new BatchProcessor(
      new DynamoDbItemReader(new AWS.DynamoDB.DocumentClient(dynamoDbOptions), {
        TableName: "Music"
      }),
      itemProcessor
    );
    await batchProcessor.start();
    expect(itemProcessor).toHaveBeenCalledTimes(3);
    expect(itemProcessor).toHaveBeenCalledWith({ Artist: "Foo" });
    expect(itemProcessor).toHaveBeenCalledWith({ Artist: "Bar" });
    expect(itemProcessor).toHaveBeenCalledWith({ Artist: "Fiz" });
  });

  it("should take batch size to limit the number of item processed", async () => {
    const itemProcessor = jest.fn();
    const batchProcessor = new BatchProcessor(
      new DynamoDbItemReader(new AWS.DynamoDB.DocumentClient(dynamoDbOptions), {
        TableName: "Music"
      }),
      itemProcessor,
      1
    );
    await batchProcessor.start();
    expect(itemProcessor).toHaveBeenCalledTimes(1);
  });

  it("should recurse when time is up");

  it("should not return unefined item when lastEvaluatedKey is not empty");

  afterAll(() => {
    return DynamoDbLocal.stop(dynamoLocalPort);
  });
});
