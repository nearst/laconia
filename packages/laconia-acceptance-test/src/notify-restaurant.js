// @ts-check
const laconia = require("@laconia/core");
const { kinesis } = require("@laconia/event");
const SnsRestaurantNotificationTopic = require("./SnsRestaurantNotificationTopic");

const adapter = app => (event, dependencies) => {
  const orderEvents = kinesis(event).records.map(r => r.jsonData);
  return app(orderEvents, dependencies);
};

const app = async (orderEvents, { restaurantNotificationTopic }) => {
  return Promise.all(
    orderEvents
      .filter(o => o.eventType === "placed")
      .map(o => restaurantNotificationTopic.publish(o))
  );
};

exports.handler = laconia(adapter(app)).register(
  "restaurantNotificationTopic",
  ({ env }) =>
    new SnsRestaurantNotificationTopic(env.RESTAURANT_NOTIFICATION_TOPIC_ARN)
);
