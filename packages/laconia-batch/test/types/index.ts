import laconiaBatch from "../../src/index";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const { S3Client } = require("@aws-sdk/client-s3");

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
  documentClient: DynamoDBDocumentClient.from(new DynamoDBClient({}))
});

laconiaBatch(() =>
  laconiaBatch.s3({
    path: ".",
    s3Params: {
      Bucket: "MyBucket",
      Key: "array.json"
    }
  })
)
  .register(() => ({ someKey: "value" }))
  .on("start", laconiaContext => {
    console.log(laconiaContext);
  })
  .on("end", laconiaContext => {
    console.log(laconiaContext);
  })
  .on("item", (laconiaContext, item) => {
    console.log(laconiaContext, item);
  })
  .on("stop", (laconiaContext, cursor) => {
    console.log(laconiaContext, cursor);
  });

laconiaBatch.s3({
  path: 'database.music[0]["category"].list',
  s3Params: {
    Bucket: "MyBucket",
    Key: "object.json"
  },
  s3: new S3Client()
});
