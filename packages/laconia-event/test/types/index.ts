import { S3Handler } from "aws-lambda";
import { s3 } from "../../src/index";
import AWS from "aws-sdk";

const handler: S3Handler = event => {
  const s3Event = s3(event);
  console.log(s3Event.bucket);
  console.log(s3Event.key);
  console.log(s3Event.getObject());
  console.log(s3Event.getJson());
  s3Event.getStream().pipe(process.stdout);

  s3(event, new AWS.S3());
};
