import { S3Handler } from "aws-lambda";
import { s3 } from "../../src/index";

const handler: S3Handler = event => {
  const s3Event = s3(event);
  console.log(s3Event.bucket);
  console.log(s3Event.key);
};
