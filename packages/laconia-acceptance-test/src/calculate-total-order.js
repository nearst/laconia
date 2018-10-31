const laconiaBatch = require("@laconia/batch");
const { tracker } = require("@laconia/test-helper");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");
const S3TotalOrderStorage = require("./S3TotalOrderStorage");

const instances = ({ context, env, $s3 }) => ({
  tracker: tracker(context.functionName),
  orderRepository: new DynamoDbOrderRepository(env.ORDER_TABLE_NAME),
  totalOrderStorage: new S3TotalOrderStorage($s3, env.TOTAL_ORDER_BUCKET_NAME)
});

module.exports.handler = laconiaBatch(
  _ =>
    laconiaBatch.s3({
      path: ".",
      s3Params: {
        Bucket: process.env["RESTAURANT_BUCKET_NAME"],
        Key: "restaurants.json"
      }
    }),
  { itemsPerSecond: 2 }
)
  .register(instances)
  .on(
    "item",
    async ({ tracker, orderRepository, totalOrderStorage }, restaurantId) => {
      const orders = await orderRepository.findByRestaurantId(restaurantId);
      await tracker.tick({
        restaurantId,
        total: orders.reduce((acc, order) => acc + order.total, 0)
      });
      await totalOrderStorage.putJson({
        restaurantId,
        total: orders.reduce((acc, order) => acc + order.total, 0)
      });
    }
  );
