const laconiaApi = require("@laconia/api");
const KinesisOrderStream = require("./KinesisOrderStream");

const instances = ({ env }) => ({
  orderStream: new KinesisOrderStream(env.ORDER_STREAM_NAME)
});

const handler = async ({ req }, { orderStream }) => {
  console.log(req);
  const orderId = req.pathParameters.id;
  await orderStream.send({ eventType: "accepted", orderId });
  return { status: "ok" };
};

module.exports.handler = laconiaApi(handler).register(instances);
