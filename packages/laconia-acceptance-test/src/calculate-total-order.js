const { laconiaBatch, s3 } = require("laconia-batch");
const { tracker } = require("laconia-test");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");

const instances = ({ context, env }) => ({
  tracker: tracker(context.functionName),
  orderRepository: new DynamoDbOrderRepository(env.ORDER_TABLE_NAME)
});

module.exports.handler = laconiaBatch(
  _ =>
    s3({
      path: ".",
      s3Params: {
        Bucket: process.env["RESTAURANT_BUCKET_NAME"],
        Key: "restaurants.json"
      }
    }),
  { itemsPerSecond: 2 }
)
  .register(instances)
  .on("item", async ({ tracker, orderRepository }, restaurantId) => {
    const orders = await orderRepository.findByRestaurantId(restaurantId);
    tracker.tick({
      restaurantId,
      total: orders.reduce((acc, order) => acc + order.total, 0)
    });
  });
