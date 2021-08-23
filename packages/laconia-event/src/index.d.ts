import {
  S3Event as AWSS3Event,
  SNSEvent as AWSSNSEvent,
  SQSEvent as AWSSQSEvent,
  KinesisStreamEvent as AWSKinesisStreamEvent,
  APIGatewayEvent as AWSAPIGatewayEvent,
  APIGatewayProxyResult as AWSAPIGatewayProxyResult
} from "aws-lambda";
import { Readable } from "stream";

declare namespace event {
  interface S3Event {
    bucket: string;
    key: string;
    getObject: () => any;
    getJson: () => any;
    getStream: () => Readable;
    getText: () => Promise<string>
  }
  function s3(awsS3Event: AWSS3Event, s3?: any): S3Event;

  interface SnsEvent {
    message: any;
    subject: string;
  }
  function sns(awsSNSevent: AWSSNSEvent): SnsEvent;

  interface SqsRecord {
    body: any;
    receiptHandle: string;
  }
  interface SqsEvent {
    records: SqsRecord[];
  }
  function sqs(awsSQSEvent: AWSSQSEvent): SqsEvent;

  interface KinesisRecord {
    jsonData: any;
    textData: string;
    data: any;
  }
  interface KinesisEvent {
    records: KinesisRecord[];
  }
  function kinesis(awsKinesisStreamEvent: AWSKinesisStreamEvent): KinesisEvent;

  namespace apigateway {
    interface ApiGatewayInputHeaders {
      [key: string]: string;
    }

    interface ApiGatewayOutputHeaders {
      [key: string]: string | number;
    }

    interface ApiGatewayInputParams {
      [key: string]: string;
    }
    interface ApiGatewayEvent {
      body: any;
      headers: ApiGatewayInputHeaders;
      params: ApiGatewayInputParams;
    }
    function req(awsAPIGatewayEvent: AWSAPIGatewayEvent): ApiGatewayEvent;

    function res(
      output: any,
      statusCode?: number,
      headers?: ApiGatewayOutputHeaders
    ): AWSAPIGatewayProxyResult;
  }
}

export = event;
