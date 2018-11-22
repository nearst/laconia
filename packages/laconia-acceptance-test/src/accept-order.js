const laconia = require("@laconia/core");
const KinesisOrderStream = require("./KinesisOrderStream");

const instances = ({ env }) => ({
  orderStream: new KinesisOrderStream(env.ORDER_STREAM_NAME)
});

const handler = async (event, { orderStream }) => {
  console.log(event);
  const orderId = event.pathParameters.id;
  await orderStream.send({ eventType: "accepted", orderId });
  return { statusCode: 200 };
};

module.exports.handler = laconia(handler).register(instances);
