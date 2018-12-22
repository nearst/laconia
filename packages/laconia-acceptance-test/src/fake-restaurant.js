const laconiaEvent = require("@laconia/event").snsJson();
const r2 = require("r2");

const handler = async (order, { env }) => {
  console.log("order", order);
  if (order.restaurantId === 1) {
    console.log(`Accepting order: ${JSON.stringify(order)}`);
    const acceptUrl = `${env.API_BASE_URL}/order/${order.orderId}/accept`;
    await r2.put(acceptUrl);
  }
};

module.exports.handler = laconiaEvent(handler);
