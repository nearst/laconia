const { s3BatchHandler } = require("laconia-batch");
const tracker = require("laconia-test-helper").tracker("batch-s3");

let lambdaContext;
module.exports.handler = s3BatchHandler(
  ".",
  {
    Bucket: process.env["TEST_BUCKET_NAME"],
    Key: "batch-s3.json"
  },
  { itemsPerSecond: 2 }
)
  .on("start", (event, context) => {
    lambdaContext = context;
  })
  .on("item", item => {
    console.log(item);
    return tracker.tick({
      context: lambdaContext,
      item
    });
  });
