const laconia = require("@laconia/core");
const sns = require("@laconia/adapter").sns();
const r2 = require("r2");

const app = async (order, { env }) => {
  console.log("order", order);
  if (order.restaurantId === 1) {
    console.log(`Accepting order: ${JSON.stringify(order)}`);
    const acceptUrl = `${env.API_BASE_URL}/order/${order.orderId}/accept`;
    await r2.put(acceptUrl);
  }
};

exports.handler = laconia(sns(app));
