import { S3Event, SNSEvent } from "aws-lambda";
import { Readable } from "stream";

declare namespace event {
  type LaconiaS3Event = {
    bucket: string;
    key: string;
    getObject: () => any;
    getJson: () => any;
    getStream: () => Readable;
  };
  function s3(awsS3Event: S3Event, s3?: any): LaconiaS3Event;

  type LaconiaSNSEvent = {
    /**
     * @returns Returns the body of the SNS message. The message will automatically be JSON parsed.
     */
    message: string | object;
    subject: string;
  };
  function sns(awsSNSevent: SNSEvent): LaconiaSNSEvent;
}

export = event;
