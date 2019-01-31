const laconia = require("@laconia/core");
const apigateway = require("@laconia/adapter-api").apigateway({
  inputType: "params"
});
const KinesisOrderStream = require("./KinesisOrderStream");

const instances = ({ env }) => ({
  orderStream: new KinesisOrderStream(env.ORDER_STREAM_NAME)
});

const app = async ({ id }, { orderStream }) => {
  await orderStream.send({ eventType: "accepted", orderId: id });
  return { status: "ok" };
};

exports.handler = laconia(apigateway(app)).register(instances);
