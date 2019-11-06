const merge = require("lodash/merge");
const DynamoDbStreamEvent = require("../src/DynamoDbStreamEvent");
const DynamoDbStreamRecord = require("../src/DynamoDbStreamRecord");

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

describe("DynamoDbStreamEvent", () => {
  it("Should parse single record", () => {
    const newImage = {
      Message: {
        S: "Stream sample record!"
      },
      Id: {
        N: "110"
      },
      List: { L: [{ S: "fizz" }, { S: "buzz" }, { S: "pop" }] }
    };

    const jsonNewImage = {
      Message: "Stream sample record!",
      Id: 110,
      List: ["fizz", "buzz", "pop"]
    };
    const dynamoDbStreamEvent = DynamoDbStreamEvent.fromRaw(
      createDynamoDbStreamEvent([Object.assign({}, newImage)])
    );

    expect(dynamoDbStreamEvent.records).toHaveLength(1);
    expect(dynamoDbStreamEvent.records[0]).toBeInstanceOf(DynamoDbStreamRecord);
    expect(dynamoDbStreamEvent.records[0].newImage).toEqual(newImage);
    expect(dynamoDbStreamEvent.records[0].jsonNewImage).toEqual(jsonNewImage);
  });

  it("Should parse multiple record", () => {
    const dynamoDbStreamEvent = DynamoDbStreamEvent.fromRaw(
      createDynamoDbStreamEvent([
        {
          Message: {
            S: "New item!"
          },
          Id: {
            N: "105"
          }
        },
        {
          Message: {
            S: "Newest item!"
          },
          Id: {
            N: "106"
          }
        }
      ])
    );

    expect(dynamoDbStreamEvent).toBeInstanceOf(DynamoDbStreamEvent);
    expect(dynamoDbStreamEvent.records).toHaveLength(2);
  });
});
