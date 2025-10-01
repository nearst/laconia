const { mockClient } = require("aws-sdk-client-mock");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const DynamoDbItemReader = require("../src/DynamoDbItemReader");
const { collectNexts } = require("@laconia/test-helper");

describe("DynamoDb Item Reader", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  const dynamoDbParams = { TableName: "Music" };

  beforeEach(() => {
    ddbMock.reset();
  });

  describe("when using QUERY operation", () => {
    beforeEach(async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [] });

      const documentClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
      );
      const reader = new DynamoDbItemReader(
        "QUERY",
        documentClient,
        dynamoDbParams
      );
      await reader.next();
    });

    it("queries DynamoDb", () => {
      const scanCalls = ddbMock
        .calls()
        .filter(call => call.args[0].constructor.name === "ScanCommand");
      const queryCalls = ddbMock
        .calls()
        .filter(call => call.args[0].constructor.name === "QueryCommand");

      expect(scanCalls.length).toEqual(0);
      expect(queryCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("uses the specified parameters", () => {
      const calls = ddbMock.calls();
      expect(calls[0].args[0].input).toEqual(dynamoDbParams);
    });
  });

  describe("when using SCAN operation", () => {
    beforeEach(async () => {
      ddbMock.on(ScanCommand).resolves({ Items: [] });

      const documentClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
      );
      const reader = new DynamoDbItemReader(
        "SCAN",
        documentClient,
        dynamoDbParams
      );
      await reader.next();
    });

    it("scans DynamoDb", () => {
      const scanCalls = ddbMock
        .calls()
        .filter(call => call.args[0].constructor.name === "ScanCommand");
      const queryCalls = ddbMock
        .calls()
        .filter(call => call.args[0].constructor.name === "QueryCommand");

      expect(scanCalls.length).toBeGreaterThanOrEqual(1);
      expect(queryCalls.length).toEqual(0);
    });

    it("uses the specified parameters", () => {
      const calls = ddbMock.calls();
      expect(calls[0].args[0].input).toEqual(dynamoDbParams);
    });
  });

  it("throws error when operation is not supported", async () => {
    const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    expect(
      () => new DynamoDbItemReader("BOOM", documentClient, dynamoDbParams)
    ).toThrow(
      "Unsupported DynamoDB operation! Supported operations are SCAN and QUERY."
    );
  });

  it("generates next object", async () => {
    ddbMock.on(ScanCommand).resolves({ Items: ["Foo"] });

    const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const reader = new DynamoDbItemReader(
      "SCAN",
      documentClient,
      dynamoDbParams
    );
    const next = await reader.next();

    expect(next).toEqual({ item: "Foo", cursor: { index: 0 }, finished: true });
  });

  describe("when multiple items are returned in a single scan", () => {
    let nexts;

    beforeEach(async () => {
      ddbMock.on(ScanCommand).resolves({ Items: ["Foo", "Bar", "Fiz"] });

      const documentClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
      );
      const reader = new DynamoDbItemReader(
        "SCAN",
        documentClient,
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
      expect(ddbMock.calls().length).toEqual(1);
    });
  });

  describe("when multiple items are returned in multiple scans", () => {
    let nexts;

    beforeEach(async () => {
      ddbMock
        .on(ScanCommand)
        .resolvesOnce({ Items: ["Foo", "Bar"], LastEvaluatedKey: "Bar" })
        .resolvesOnce({ Items: ["Fiz", "Baz"], LastEvaluatedKey: "Baz" })
        .resolvesOnce({ Items: ["Boo", "Boz"] });

      const documentClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
      );
      const reader = new DynamoDbItemReader(
        "SCAN",
        documentClient,
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
      expect(ddbMock.calls().length).toEqual(3);
    });
  });

  describe("when start reading in the middle", () => {
    let nexts;

    beforeEach(async () => {
      ddbMock
        .on(ScanCommand)
        .resolvesOnce({ Items: ["Fiz", "Baz"], LastEvaluatedKey: "Baz" })
        .resolvesOnce({ Items: ["Boo"] });

      const documentClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
      );
      const reader = new DynamoDbItemReader(
        "SCAN",
        documentClient,
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
      expect(ddbMock.calls().length).toEqual(2);
    });
  });
});
