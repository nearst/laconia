import {
  S3Handler,
  S3Event,
  SNSHandler,
  SNSEvent,
  SQSHandler,
  SQSEvent,
  KinesisStreamHandler,
  KinesisStreamEvent,
  APIGatewayProxyHandler,
  APIGatewayEvent
} from "aws-lambda";
import { s3, sns, sqs, kinesis, apigateway } from "../../src/index";
const { req, res } = apigateway;

import AWS from "aws-sdk";
import { integer } from "aws-sdk/clients/lightsail";

const s3Handler: S3Handler = (event: S3Event) => {
  const s3Event = s3(event);
  console.log(s3Event.bucket);
  console.log(s3Event.key);
  console.log(s3Event.getObject());
  console.log(s3Event.getJson());
  s3Event.getStream().pipe(process.stdout);

  s3(event, new AWS.S3());
};

const snsHandler: SNSHandler = (event: SNSEvent) => {
  const snsEvent = sns(event);
  console.log(snsEvent.message);
  console.log(snsEvent.subject);
};

const sqsHandler: SQSHandler = (event: SQSEvent) => {
  const sqsEvent = sqs(event);
  console.log(sqsEvent.records.map(r => r.body));
};

const kinesisHandler: KinesisStreamHandler = (event: KinesisStreamEvent) => {
  const kinesisEvent = kinesis(event);
  kinesisEvent.records.forEach(r => {
    console.log(r.jsonData);
    console.log(r.textData);
    console.log(r.data);
  });
};

const apiGatewayHandler: APIGatewayProxyHandler = (event: APIGatewayEvent) => {
  const r = req(event);
  console.log(r.body);
  console.log(r.headers.TEST);
  console.log(r.params.id);

  res("Not found", 404);
  res({ hello: "world" });
  res({ error: "not found" }, 404, {
    "Access-Allow-Control-Origin": "*"
  });
  return Promise.resolve(res("Success"));
};
