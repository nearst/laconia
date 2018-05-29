const { laconia } = require("laconia-core");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");
const UuidIdGenerator = require("./UuidIdGenerator");
var log = require("pino")("place-order");

const instances = lc => ({
  orderRepository: new DynamoDbOrderRepository(lc.env.ORDER_TABLE_NAME),
  idGenerator: new UuidIdGenerator()
});

module.exports.handler = laconia(
  async ({ event, orderRepository, idGenerator }) => {
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
).register(instances);
