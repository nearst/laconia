const laconiaApi = require("@laconia/api").params();
const KinesisOrderStream = require("./KinesisOrderStream");

const instances = ({ env }) => ({
  orderStream: new KinesisOrderStream(env.ORDER_STREAM_NAME)
});

const handler = async ({ id }, { orderStream }) => {
  await orderStream.send({ eventType: "accepted", orderId: id });
  return { status: "ok" };
};

module.exports.handler = laconiaApi(handler).register(instances);
