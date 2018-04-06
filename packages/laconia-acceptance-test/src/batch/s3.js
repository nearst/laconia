const { laconiaBatch, s3 } = require("laconia-batch");
const tracker = require("laconia-test-helper").tracker("batch-s3");

module.exports.handler = laconiaBatch(
  _ =>
    s3({
      path: ".",
      s3Params: {
        Bucket: process.env["TEST_BUCKET_NAME"],
        Key: "batch-s3.json"
      }
    }),
  { itemsPerSecond: 2 }
).on("item", ({ context }, item) => tracker.tick({ context, item }));
