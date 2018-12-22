const laconiaEvent = require("@laconia/event").kinesisJson();
const AWS = require("aws-sdk");

const handler = async (orderEvents, { env }) => {
  const acceptedEvents = orderEvents.filter(o => o.eventType === "accepted");
  console.log(acceptedEvents);
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

module.exports.handler = laconiaEvent(handler);
