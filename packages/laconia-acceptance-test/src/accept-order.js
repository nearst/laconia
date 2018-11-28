const laconiaApi = require("@laconia/api");
const KinesisOrderStream = require("./KinesisOrderStream");

const instances = ({ env }) => ({
  orderStream: new KinesisOrderStream(env.ORDER_STREAM_NAME)
});

const handler = async ({ req, res }, { orderStream }) => {
  console.log(req, res);
  const orderId = req.pathParameters.id;
  await orderStream.send({ eventType: "accepted", orderId });
  return res.status(200).send({ status: "ok" });
};

module.exports.handler = laconiaApi(handler).register(instances);
