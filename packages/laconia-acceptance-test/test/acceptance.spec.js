const { lambdaInvoker } = require("laconia-invoke");
const tracker = require("laconia-test-helper").tracker;

const prefix = "laconia-acceptance-test";
const name = name => `${prefix}-${name}`;
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

describe("laconia-handler basicHandler", () => {
  it("returns result", async () => {
    const result = await lambdaInvoker(name("handler-basic")).requestResponse();
    expect(result).toEqual("hello");
  });
});

describe("laconia-handler recursiveHandler", () => {
  it("recurses three times", async () => {
    const recursiveTracker = tracker("recursive", name("tracker"));
    await recursiveTracker.clear();
    await lambdaInvoker(name("handler-recursive")).fireAndForget({ input: 1 });

    await recursiveTracker.waitUntil(3);
    expect(await recursiveTracker.getTotal()).toEqual(3);
  });
});

describe("laconia-batch-s3 s3-batch-handler", () => {
  it("processes all items with at least 2 different Lambda request Id", async () => {
    jest.setTimeout(10000);
    const s3BatchTracker = tracker("batch-s3", name("tracker"));
    await s3BatchTracker.clear();
    const items = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    await s3
      .putObject({
        Bucket: name("bucket"),
        Key: "batch-s3.json",
        Body: JSON.stringify(items)
      })
      .promise();
    await lambdaInvoker(name("batch-s3")).fireAndForget();

    await s3BatchTracker.waitUntil(10);
    const ticks = await s3BatchTracker.getTicks();
    const requestIds = ticks.map(t => t.context.awsRequestId);
    expect(requestIds.length).toBeGreaterThanOrEqual(2);

    const tickItems = ticks.map(t => t.item);
    expect(tickItems).toHaveLength(10);
    items.forEach(item => {
      expect(tickItems).toContain(item);
    });
  });
});

describe("laconia-dynamodb-batch-handler", () => {
  it("processes all items with at least 3 different Lambda request Id");
});
