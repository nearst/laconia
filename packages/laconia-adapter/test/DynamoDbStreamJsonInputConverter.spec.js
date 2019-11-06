const merge = require("lodash/merge");
const DynamoDbStreamJsonInputConverter = require("../src/DynamoDbStreamJsonInputConverter");

const dynamodbTemplate = {
  eventID: "1",
  eventVersion: "1.0",
  dynamodb: {
    Keys: {
      Id: {
        N: "101"
      }
    },
    NewImage: {
      Message: {
        S: "New item!"
      },
      Id: {
        N: "101"
      }
    },
    StreamViewType: "NEW_AND_OLD_IMAGES",
    SequenceNumber: "111",
    SizeBytes: 26
  },
  awsRegion: "us-west-2",
  eventName: "INSERT",
  eventSourceARN: "arn:aws:dynamodb:us-east-1:123456789012:table/images",
  eventSource: "aws:dynamodb"
};

const createDynamoDbStreamEvent = records => {
  return merge({}, dynamodbTemplate, {
    Records: records.map(r => ({
      dynamodb: {
        NewImage: r
      }
    }))
  });
};

describe("DynamoDbStreamJsonInputConverter", () => {
  it("Should convert one stream record event", async () => {
    const inputConverter = new DynamoDbStreamJsonInputConverter();
    const newImage = {
      Number: { N: "123" },
      Null: { NULL: true },
      Boolean: { BOOL: true }
    };
    const input = await inputConverter.convert(
      createDynamoDbStreamEvent([newImage])
    );

    expect(input).toEqual([
      {
        Number: 123,
        Null: null,
        Boolean: true
      }
    ]);
  });

  it("Should convert multiple stream record event", async () => {
    const inputConverter = new DynamoDbStreamJsonInputConverter();
    const images = [
      {
        Number: { N: "123" },
        Null: { NULL: true },
        Boolean: { BOOL: true }
      },
      {
        Message: {
          S: "Stream sample record!"
        },
        Id: {
          N: "110"
        },
        List: { L: [{ S: "fizz" }, { S: "buzz" }, { S: "pop" }] }
      }
    ];
    const input = await inputConverter.convert(
      createDynamoDbStreamEvent(images)
    );

    expect(input).toEqual([
      {
        Number: 123,
        Null: null,
        Boolean: true
      },
      {
        Message: "Stream sample record!",
        Id: 110,
        List: ["fizz", "buzz", "pop"]
      }
    ]);
  });
});
