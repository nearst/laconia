const { laconia } = require("laconia-core");
const OrderRepository = require("./OrderRepository");

module.exports.handler = laconia(({ event, orderRepository }) => {
  return orderRepository.save(event.body.order);
}).on("init", lc => {
  lc.register({
    orderRepository: new OrderRepository(lc.env.ORDER_TABLE_NAME)
  });
});
