const { lambdaInvoker } = require("laconia-invoke");
const tracker = require("laconia-test-helper").tracker;

const prefix = "laconia-acceptance-test";
const name = name => `${prefix}-${name}`;
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const items = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

jest.setTimeout(10000);

describe("laconia-handler basicHandler", () => {
  it("returns result", async () => {
    const result = await lambdaInvoker(name("handler-basic")).requestResponse();
    expect(result).toEqual("hello");
  });
});

describe("laconia-handler recursiveHandler", () => {
  const recursiveTracker = tracker("recursive", name("tracker"));

  beforeAll(async () => {
    await recursiveTracker.clear();
    await lambdaInvoker(name("handler-recursive")).fireAndForget({ input: 1 });
    await recursiveTracker.waitUntil(3);
  });

  it("recurses three times", async () => {
    expect(await recursiveTracker.getTotal()).toEqual(3);
  });
});

describe("laconia-batch-s3 s3-batch-handler", () => {
  const s3BatchTracker = tracker("batch-s3", name("tracker"));

  beforeAll(() =>
    s3
      .putObject({
        Bucket: name("bucket"),
        Key: "batch-s3.json",
        Body: JSON.stringify(items)
      })
      .promise());

  beforeAll(async () => {
    await s3BatchTracker.clear();
    await lambdaInvoker(name("batch-s3")).fireAndForget();
    await s3BatchTracker.waitUntil(10);
  });

  it("processes items with at least 3 separate Lambda requests", async () => {
    const ticks = await s3BatchTracker.getTicks();
    const requestIds = ticks.map(t => t.context.awsRequestId);
    expect(requestIds.length).toBeGreaterThanOrEqual(3);
  });

  it("processes all items", async () => {
    const ticks = await s3BatchTracker.getTicks();
    const tickItems = ticks.map(t => t.item);
    expect(tickItems).toEqual(items);
  });
});
