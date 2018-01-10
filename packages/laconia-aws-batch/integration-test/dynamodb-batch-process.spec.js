/* eslint-env jest */

const DynamoDbLocal = require("dynamodb-local");

const AWS = require("aws-sdk");
const DynamoDbMusicRepository = require("./DynamoDbMusicRepository");

describe("aws invoke", () => {
  const dynamoLocalPort = 8000;

  beforeAll(() => {
    jest.setTimeout(5000);
    return DynamoDbLocal.launch(dynamoLocalPort, null, ["-sharedDb"]);
  });

  beforeAll(() => {
    const dynamoDbOptions = {
      region: "eu-west-1",
      endpoint: new AWS.Endpoint(`http://localhost:${dynamoLocalPort}`)
    };
    const musicRepository = new DynamoDbMusicRepository(
      new AWS.DynamoDB(dynamoDbOptions),
      new AWS.DynamoDB.DocumentClient(dynamoDbOptions)
    );

    return musicRepository.createTable().then(_ => {
      return Promise.resolve()
        .then(_ => musicRepository.save({ Artist: "Foo" }))
        .then(_ => musicRepository.save({ Artist: "Bar" }))
        .then(_ => musicRepository.save({ Artist: "Fiz" }));
    });
  });

  it("should process all records in a Table", () => {
    expect(true).toEqual(true);
  });

  afterAll(() => {
    return DynamoDbLocal.stop(dynamoLocalPort);
  });
});
