// @ts-check
const laconia = require("@laconia/core");
const sns = require("@laconia/adapter").sns();
const axios = require("axios").default;

const app = async (order, { env }) => {
  console.log("order", order);
  if (order.restaurantId === 1) {
    const acceptUrl = `${env.API_BASE_URL}/order/${order.orderId}/accept`;
    console.log(`Accepting order ${JSON.stringify(order)} at ${acceptUrl}`);
    try {
      await axios.put(acceptUrl);
    } catch (e) {
      if (e.response) {
        console.error("Error from server", e.response.data);
      }
      throw e;
    }
  }
};

exports.handler = laconia(sns(app));
