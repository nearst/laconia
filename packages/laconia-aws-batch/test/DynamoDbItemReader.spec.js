/* eslint-env jest */
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const DynamoDbItemReader = require("../src/DynamoDbItemReader");
const { yields, collectNexts } = require("laconia-test-helper");

describe("DynamoDb Item Reader", () => {
  let documentClient;
  const dynamoDbParams = { TableName: "Music" };

  beforeEach(() => {
    documentClient = {
      query: jest.fn().mockImplementation(yields({ Items: [] })),
      scan: jest.fn().mockImplementation(yields({ Items: [] }))
    };
    AWSMock.mock("DynamoDB.DocumentClient", "query", documentClient.query);
    AWSMock.mock("DynamoDB.DocumentClient", "scan", documentClient.scan);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  describe("when using QUERY operation", () => {
    beforeEach(async () => {
      const reader = new DynamoDbItemReader(
        "QUERY",
        new AWS.DynamoDB.DocumentClient(),
        dynamoDbParams
      );
      await reader.next();
    });

    it("queries DynamoDb", () => {
      expect(documentClient.scan).not.toHaveBeenCalled();
      expect(documentClient.query).toHaveBeenCalled();
    });

    it("uses the specified parameters", () => {
      expect(documentClient.query).toHaveBeenCalledWith(
        dynamoDbParams,
        expect.any(Function)
      );
    });
  });

  describe("when using SCAN operation", () => {
    beforeEach(async () => {
      const reader = new DynamoDbItemReader(
        "SCAN",
        new AWS.DynamoDB.DocumentClient(),
        dynamoDbParams
      );
      await reader.next();
    });

    it("scans DynamoDb", () => {
      expect(documentClient.query).not.toHaveBeenCalled();
      expect(documentClient.scan).toHaveBeenCalled();
    });

    it("uses the specified parameters", () => {
      expect(documentClient.scan).toHaveBeenCalledWith(
        dynamoDbParams,
        expect.any(Function)
      );
    });
  });

  it("throws error when operation is not supported", async () => {
    expect(
      () =>
        new DynamoDbItemReader(
          "BOOM",
          new AWS.DynamoDB.DocumentClient(),
          dynamoDbParams
        )
    ).toThrow(
      "Unsupported DynamoDB operation! Supported operations are SCAN and QUERY."
    );
  });

  it("generates next object", async () => {
    documentClient.scan.mockImplementation(yields({ Items: ["Foo"] }));
    const reader = new DynamoDbItemReader(
      "SCAN",
      new AWS.DynamoDB.DocumentClient(),
      dynamoDbParams
    );
    const next = await reader.next();

    expect(next).toEqual({ item: "Foo", cursor: { index: 0 }, finished: true });
  });

  describe("when multiple items are returned in a single scan", () => {
    let nexts;

    beforeEach(async () => {
      nexts = [];
      documentClient.scan.mockImplementation(
        yields({ Items: ["Foo", "Bar", "Fiz"] })
      );
      const reader = new DynamoDbItemReader(
        "SCAN",
        new AWS.DynamoDB.DocumentClient(),
        dynamoDbParams
      );
      nexts = await collectNexts(reader, 3);
    });

    it("generates nexts object with the correct content", () => {
      expect(nexts[0]).toEqual({
        item: "Foo",
        cursor: { index: 0 },
        finished: false
      });
      expect(nexts[1]).toEqual({
        item: "Bar",
        cursor: { index: 1 },
        finished: false
      });
      expect(nexts[2]).toEqual({
        item: "Fiz",
        cursor: { index: 2 },
        finished: true
      });
    });

    it("should cache result", () => {
      expect(documentClient.scan).toHaveBeenCalledTimes(1);
    });
  });

  describe("when multiple items are returned in multiple scans", () => {
    let nexts;

    beforeEach(async () => {
      nexts = [];
      documentClient.scan.mockImplementationOnce(
        yields({ Items: ["Foo", "Bar"], LastEvaluatedKey: "Bar" })
      );
      documentClient.scan.mockImplementationOnce(
        yields({ Items: ["Fiz", "Baz"], LastEvaluatedKey: "Baz" })
      );
      documentClient.scan.mockImplementationOnce(
        yields({ Items: ["Boo", "Boz"] })
      );
      const reader = new DynamoDbItemReader(
        "SCAN",
        new AWS.DynamoDB.DocumentClient(),
        dynamoDbParams
      );
      nexts = await collectNexts(reader, 6);
    });

    it("generates nexts object with the correct content", () => {
      expect(nexts[0]).toEqual({
        item: "Foo",
        cursor: { index: 0, lastEvaluatedKey: "Bar" },
        finished: false
      });
      expect(nexts[1]).toEqual({
        item: "Bar",
        cursor: { index: 1, lastEvaluatedKey: "Bar" },
        finished: false
      });
      expect(nexts[2]).toEqual({
        item: "Fiz",
        cursor: { index: 0, exclusiveStartKey: "Bar", lastEvaluatedKey: "Baz" },
        finished: false
      });
      expect(nexts[3]).toEqual({
        item: "Baz",
        cursor: { index: 1, exclusiveStartKey: "Bar", lastEvaluatedKey: "Baz" },
        finished: false
      });
      expect(nexts[4]).toEqual({
        item: "Boo",
        cursor: { index: 0, exclusiveStartKey: "Baz" },
        finished: false
      });
      expect(nexts[5]).toEqual({
        item: "Boz",
        cursor: { index: 1, exclusiveStartKey: "Baz" },
        finished: true
      });
    });

    it("should cache result", () => {
      expect(documentClient.scan).toHaveBeenCalledTimes(3);
      expect(documentClient.scan).toHaveBeenCalledWith(
        dynamoDbParams,
        expect.any(Function)
      );
      expect(documentClient.scan).toHaveBeenCalledWith(
        Object.assign({ ExclusiveStartKey: "Bar" }, dynamoDbParams),
        expect.any(Function)
      );
      expect(documentClient.scan).toHaveBeenCalledWith(
        Object.assign({ ExclusiveStartKey: "Baz" }, dynamoDbParams),
        expect.any(Function)
      );
    });
  });

  describe("when start reading in the middle", () => {
    let nexts;

    beforeEach(async () => {
      nexts = [];
      documentClient.scan.mockImplementationOnce(
        yields({ Items: ["Fiz", "Baz"], LastEvaluatedKey: "Baz" })
      );
      documentClient.scan.mockImplementationOnce(yields({ Items: ["Boo"] }));
      const reader = new DynamoDbItemReader(
        "SCAN",
        new AWS.DynamoDB.DocumentClient(),
        dynamoDbParams
      );
      nexts = await collectNexts(reader, 2, {
        index: 0,
        exclusiveStartKey: "Bar",
        lastEvaluatedKey: "Baz"
      });
    });

    it("generates nexts object with the correct content", () => {
      expect(nexts[0]).toEqual({
        item: "Baz",
        cursor: { index: 1, exclusiveStartKey: "Bar", lastEvaluatedKey: "Baz" },
        finished: false
      });
      expect(nexts[1]).toEqual({
        item: "Boo",
        cursor: { index: 0, exclusiveStartKey: "Baz" },
        finished: true
      });
    });

    it("should cache result", () => {
      expect(documentClient.scan).toHaveBeenCalledTimes(2);
      expect(documentClient.scan).toHaveBeenCalledWith(
        Object.assign({ ExclusiveStartKey: "Bar" }, dynamoDbParams),
        expect.any(Function)
      );
      expect(documentClient.scan).toHaveBeenCalledWith(
        Object.assign({ ExclusiveStartKey: "Baz" }, dynamoDbParams),
        expect.any(Function)
      );
    });
  });
});
