import { S3Handler, SNSHandler, S3Event, SNSEvent } from "aws-lambda";
import { s3, sns } from "../../src/index";
import AWS from "aws-sdk";

const s3Handler: S3Handler = (event: S3Event) => {
  const s3Event = s3(event);
  console.log(s3Event.bucket);
  console.log(s3Event.key);
  console.log(s3Event.getObject());
  console.log(s3Event.getJson());
  s3Event.getStream().pipe(process.stdout);

  s3(event, new AWS.S3());
};

const handler: SNSHandler = (event: SNSEvent) => {
  const snsEvent = sns(event);
  console.log(snsEvent.message);
  console.log(snsEvent.subject);
};
