const { lambdaInvoker } = require("laconia-invoke");
const tracker = require("laconia-test-helper").tracker;

const prefix = "laconia-acceptance-test";
const name = name => `${prefix}-${name}`;

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
