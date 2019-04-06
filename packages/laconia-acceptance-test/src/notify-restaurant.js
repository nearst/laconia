const laconia = require("@laconia/core");
const { kinesis } = require("@laconia/event");
const SnsRestaurantNotificationTopic = require("./SnsRestaurantNotificationTopic");

const instances = ({ sns, env }) => ({
  restaurantNotificationTopic: new SnsRestaurantNotificationTopic(
    sns,
    env.RESTAURANT_NOTIFICATION_TOPIC_ARN
  )
});

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

exports.handler = laconia(adapter(app)).register(instances);
