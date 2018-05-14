const { laconia } = require("laconia-core");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");
const UuidIdGenerator = require("./UuidIdGenerator");

module.exports.handler = laconia(({ event, orderRepository, idGenerator }) => {
  const order = Object.assign(
    {
      OrderId: idGenerator.generate()
    },
    event.body.order
  );
  return orderRepository.save(order);
}).on("init", lc => {
  lc.register({
    orderRepository: new DynamoDbOrderRepository(lc.env.ORDER_TABLE_NAME),
    idGenerator: new UuidIdGenerator()
  });
});
