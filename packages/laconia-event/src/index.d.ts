import { S3Event } from "aws-lambda";

declare namespace event {
  type LaconiaS3Event = {
    bucket: string;
    key: string;
  };
  function s3(awsS3Event: S3Event): LaconiaS3Event;
}

export = event;
