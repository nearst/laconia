import {
  S3Event as AWSS3Event,
  SNSEvent as AWSSNSEvent,
  SQSEvent as AWSSQSEvent
} from "aws-lambda";
import { Readable } from "stream";

declare namespace event {
  interface S3Event {
    bucket: string;
    key: string;
    getObject: () => any;
    getJson: () => any;
    getStream: () => Readable;
  }
  function s3(awsS3Event: AWSS3Event, s3?: any): S3Event;

  interface SnsEvent {
    message: any;
    subject: string;
  }
  function sns(awsSNSevent: AWSSNSEvent): SnsEvent;

  interface SqsRecord {
    body: any;
  }
  interface SqsEvent {
    records: SqsRecord[];
  }
  function sqs(awsSQSEvent: AWSSQSEvent): SqsEvent;
}

export = event;
