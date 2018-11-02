const laconia = require("@laconia/core");
const S3TotalOrderStorage = require("./S3TotalOrderStorage");

const instances = ({ $s3, env }) => ({
  totalOrderStorage: new S3TotalOrderStorage($s3, env.TOTAL_ORDER_BUCKET_NAME)
});

const handler = async (event, { totalOrderStorage }) => {
  const record = event.Records[0];
  const { key } = record.s3.object;

  const totalOrder = await totalOrderStorage.getObject(key);
  console.log(totalOrder);

  await totalOrderStorage.putXml(
    `<TotalOrder><RestaurantId>${
      totalOrder.restaurantId
    }</RestaurantId><Total>${totalOrder.total}</Total></TotalOrder>`
  );
};

module.exports.handler = laconia(handler).register(instances);
