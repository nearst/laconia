import laconiaBatch from "../../src/index";
import AWS from "aws-sdk";

laconiaBatch(
  () =>
    laconiaBatch.dynamoDb({
      operation: "SCAN",
      dynamoDbParams: { TableName: "Music" }
    }),
  {
    itemsPerSecond: 0.5,
    timeNeededToRecurseInMillis: 10000
  }
);

laconiaBatch.dynamoDb({
  operation: "QUERY",
  dynamoDbParams: { TableName: "Music" },
  documentClient: new AWS.DynamoDB.DocumentClient()
});

laconiaBatch(() =>
  laconiaBatch.s3({
    path: ".",
    s3Params: {
      Bucket: "MyBucket",
      Key: "array.json"
    }
  })
).register(() => ({ someKey: "value" }));

laconiaBatch.s3({
  path: 'database.music[0]["category"].list',
  s3Params: {
    Bucket: "MyBucket",
    Key: "object.json"
  },
  s3: new AWS.S3()
});
