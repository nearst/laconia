const laconia = require("@laconia/core");
const ssm = require("@laconia/ssm");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");
const UuidIdGenerator = require("./UuidIdGenerator");
var log = require("pino")("place-order");

const validateApiKey = (event, apiKey) => {
  if (event.headers["Authorization"] !== apiKey) {
    throw new Error("Unauthorized: Wrong API Key");
  }
};

const instances = ({ env }) => ({
  orderRepository: new DynamoDbOrderRepository(env.ORDER_TABLE_NAME),
  idGenerator: new UuidIdGenerator()
});

module.exports.handler = laconia(
  async ({ event, orderRepository, idGenerator, apiKey }) => {
    validateApiKey(event, apiKey);
    const orderId = idGenerator.generate();
    const order = Object.assign(
      {
        orderId
      },
      JSON.parse(event.body).order
    );
    log.info(order, "Saving order");
    await orderRepository.save(order);
    return { statusCode: 200, body: JSON.stringify({ orderId }) };
  }
)
  .register(instances)
  .register(ssm.envVarInstances());
