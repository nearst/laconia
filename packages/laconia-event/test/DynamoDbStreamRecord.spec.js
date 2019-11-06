const DynamoDbStreamRecord = require("../src/DynamoDbStreamRecord");

const rawRecord = {
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

const createRawRecord = stream => {
  const raw = Object.assign({}, rawRecord);
  raw.dynamodb = Object.assign({}, rawRecord.dynamodb, stream);
  return raw;
};

describe("DynamoDbStreamRecord", () => {
  it("Should be able to parse from raw event", () => {
    const newImage = {
      Message: {
        S: "Test New item!"
      },
      Id: {
        N: "105"
      }
    };
    const jsonNewImage = { Message: "Test New item!", Id: 105 };

    const dynamoDbStreamRecord = DynamoDbStreamRecord.fromRaw(
      createRawRecord({
        NewImage: newImage
      })
    );

    expect(dynamoDbStreamRecord).toHaveProperty("newImage");
    expect(dynamoDbStreamRecord).toHaveProperty("jsonNewImage");
    expect(dynamoDbStreamRecord.newImage).toEqual(newImage);
    expect(dynamoDbStreamRecord.jsonNewImage).toEqual(jsonNewImage);
  });
});
