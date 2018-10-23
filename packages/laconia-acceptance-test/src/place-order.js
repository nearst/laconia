const laconia = require("@laconia/core");
const s3Config = require("@laconia/s3-config");
const config = require("@laconia/config");
const xray = require("@laconia/xray");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");
const UuidIdGenerator = require("./UuidIdGenerator");
var log = require("pino")("place-order");

const validateApiKey = (event, apiKey) => {
  if (event.headers["Authorization"] !== apiKey) {
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
  idGenerator: new UuidIdGenerator()
});

const handler = async ({
  event,
  orderRepository,
  idGenerator,
  apiKey,
  restaurants,
  enabled
}) => {
  validateEnabledFlag(enabled);
  validateApiKey(event, apiKey);
  const orderId = idGenerator.generate();
  const order = Object.assign(
    {
      orderId
    },
    JSON.parse(event.body).order
  );

  validateRestaurantId(restaurants, order.restaurantId);
  log.info(order, "Saving order");
  await orderRepository.save(order);
  return { statusCode: 200, body: JSON.stringify({ orderId }) };
};

module.exports.handler = laconia(handler)
  .register([s3Config.envVarInstances(), config.envVarInstances(), instances])
  .postProcessor(xray.postProcessor());
