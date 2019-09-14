import { S3Event } from "aws-lambda";
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
}

export = event;
