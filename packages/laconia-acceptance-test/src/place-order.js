const lambdaWarmer = require("@laconia/middleware-lambda-warmer")();
const laconiaApi = require("@laconia/api");
const config = require("@laconia/config");
const xray = require("@laconia/xray");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");
const KinesisOrderStream = require("./KinesisOrderStream");
const UuidIdGenerator = require("./UuidIdGenerator");
var log = require("pino")("place-order");

const validateApiKey = (req, apiKey) => {
  if (req.headers.authorization !== apiKey) {
    throw new Error("Unauthorized: Wrong API Key");
  }
};

const validateRestaurantId = (restaurants, restaurantId) => {
  if (!restaurants.includes(restaurantId)) {
    throw new Error(`Invalid restaurant id: ${restaurantId}`);
  }
};

const validateEnabledFlag = enabled => {
  if (!enabled) {
    throw new Error("Place order lambda is off");
  }
};

const instances = ({ env }) => ({
  orderRepository: new DynamoDbOrderRepository(env.ORDER_TABLE_NAME),
  idGenerator: new UuidIdGenerator(),
  orderStream: new KinesisOrderStream(env.ORDER_STREAM_NAME)
});

exports.mainHandler = async (
  { req },
  { orderRepository, orderStream, idGenerator, apiKey, restaurants, enabled }
) => {
  validateEnabledFlag(enabled);
  validateApiKey(req, apiKey);
  const orderId = idGenerator.generate();
  const order = Object.assign(
    {
      orderId
    },
    req.body.order
  );

  validateRestaurantId(restaurants, order.restaurantId);
  log.info(order, "Saving order");
  await orderRepository.save(order);
  await orderStream.send({
    eventType: "placed",
    orderId,
    restaurantId: order.restaurantId
  });

  return { orderId };
};

const app = laconiaApi(exports.mainHandler)
  .register([config.envVarInstances(), instances])
  .postProcessor(xray.postProcessor());

exports.handler = lambdaWarmer(app);
