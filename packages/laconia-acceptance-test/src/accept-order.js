const laconia = require("@laconia/core");
const { req, res } = require("@laconia/event").apigateway;
const KinesisOrderStream = require("./KinesisOrderStream");

const instances = ({ env }) => ({
  orderStream: new KinesisOrderStream(env.ORDER_STREAM_NAME)
});

const adapter = app => (event, dependencies) => {
  try {
    const id = req(event).params.id;
    const output = app(id, dependencies);
    return res(output);
  } catch (err) {
    return res(err.message, 500);
  }
};

const app = async (id, { orderStream }) => {
  await orderStream.send({ eventType: "accepted", orderId: id });
  return { status: "ok" };
};

exports.handler = laconia(adapter(app)).register(instances);
