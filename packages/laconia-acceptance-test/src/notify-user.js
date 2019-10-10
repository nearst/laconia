// @ts-check
const laconia = require("@laconia/core");
const kinesis = require("@laconia/adapter").kinesis();
const AWS = require("aws-sdk");

const app = async (orderEvents, { env }) => {
  const acceptedEvents = orderEvents.filter(o => o.eventType === "accepted");
  console.log("acceptedEvents", acceptedEvents);
  const sqs = new AWS.SQS();
  return Promise.all(
    acceptedEvents.map(e =>
      sqs
        .sendMessage({
          QueueUrl: env.USER_EMAIL_QUEUE_URL,
          MessageBody: JSON.stringify(e)
        })
        .promise()
    )
  );
};

exports.handler = laconia(kinesis(app));
