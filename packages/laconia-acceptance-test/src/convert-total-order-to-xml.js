const laconia = require("@laconia/core");
const event = require("@laconia/event");
const S3TotalOrderStorage = require("./S3TotalOrderStorage");

const instances = ({ $s3, env }) => ({
  totalOrderStorage: new S3TotalOrderStorage($s3, env.TOTAL_ORDER_BUCKET_NAME)
});

const handler = async (s3Event, { totalOrderStorage }) => {
  const totalOrder = await s3Event.getJson();

  await totalOrderStorage.put(
    "xml",
    `<TotalOrder><RestaurantId>${
      totalOrder.restaurantId
    }</RestaurantId><Total>${totalOrder.total}</Total></TotalOrder>`
  );
};

module.exports.handler = laconia(handler).register([
  instances,
  event.s3Event()
]);
