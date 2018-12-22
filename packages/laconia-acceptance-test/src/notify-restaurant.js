const laconiaEvent = require("@laconia/event").kinesisJson();
const SnsRestaurantNotificationTopic = require("./SnsRestaurantNotificationTopic");

const instances = ({ $sns, env }) => ({
  restaurantNotificationTopic: new SnsRestaurantNotificationTopic(
    $sns,
    env.RESTAURANT_NOTIFICATION_TOPIC_ARN
  )
});

const handler = async (orderEvents, { restaurantNotificationTopic }) => {
  return Promise.all(
    orderEvents
      .filter(o => o.eventType === "placed")
      .map(o => restaurantNotificationTopic.publish(o))
  );
};

module.exports.handler = laconiaEvent(handler).register(instances);
