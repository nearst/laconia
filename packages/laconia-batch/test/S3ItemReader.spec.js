const { mockClient } = require("aws-sdk-client-mock");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const S3ItemReader = require("../src/S3ItemReader");
const _ = require("lodash");
const { collectNexts, reduceNexts } = require("@laconia/test-helper");

describe("S3 Item Reader", () => {
  let s3Mock;
  const s3Params = { Bucket: "bucket", Key: "key" };

  beforeEach(() => {
    s3Mock = mockClient(S3Client);
  });

  afterEach(() => {
    s3Mock.reset();
  });

  const createS3Response = content => {
    const jsonString = JSON.stringify(content);
    return {
      Body: {
        transformToString: () => Promise.resolve(jsonString)
      }
    };
  };

  it("retrieves a directly stored array", async () => {
    s3Mock.on(GetObjectCommand).resolves(createS3Response(["Foo"]));
    const reader = new S3ItemReader(new S3Client(), s3Params, ".");
    const next = await reader.next();

    expect(next).toEqual({ item: "Foo", cursor: { index: 0 }, finished: true });
  });

  it("retrieves next item when path given is an array of 1 item", async () => {
    s3Mock.on(GetObjectCommand).resolves(createS3Response(["Foo"]));
    const reader = new S3ItemReader(new S3Client(), s3Params, ".");
    const next = await reader.next();

    expect(next).toEqual({ item: "Foo", cursor: { index: 0 }, finished: true });
  });

  it("retrieves array from a simple object path", async () => {
    s3Mock.on(GetObjectCommand).resolves(
      createS3Response({
        list: ["Foo"]
      })
    );
    const reader = new S3ItemReader(new S3Client(), s3Params, "list");
    const next = await reader.next();

    expect(next).toHaveProperty("item", "Foo");
  });

  it("retrieves array from a complex object path", async () => {
    s3Mock.on(GetObjectCommand).resolves(
      createS3Response({
        database: {
          music: [
            {
              category: {
                list: ["Foo"]
              }
            }
          ]
        }
      })
    );
    const reader = new S3ItemReader(
      new S3Client(),
      s3Params,
      'database.music[0]["category"].list'
    );
    const next = await reader.next();

    expect(next).toHaveProperty("item", "Foo");
  });

  describe("when multiple items are returned", () => {
    let nexts;

    beforeEach(async () => {
      s3Mock
        .on(GetObjectCommand)
        .resolves(createS3Response(["Foo", "Bar", "Fiz"]));
      const reader = new S3ItemReader(new S3Client(), s3Params, ".");
      nexts = await collectNexts(reader, 3);
    });

    it("generates nexts object with the correct content", async () => {
      expect(nexts[0]).toEqual({
        item: "Foo",
        cursor: { index: 0 },
        finished: false
      });
      expect(nexts[1]).toEqual({
        item: "Bar",
        cursor: { index: 1 },
        finished: false
      });
      expect(nexts[2]).toEqual({
        item: "Fiz",
        cursor: { index: 2 },
        finished: true
      });
    });

    it("caches S3 result", async () => {
      expect(s3Mock.calls().length).toBe(1);
    });
  });

  describe("when start reading in the middle", () => {
    let nexts;

    beforeEach(async () => {
      s3Mock
        .on(GetObjectCommand)
        .resolves(createS3Response(["1", "2", "3", "Foo", "Bar", "Fiz"]));
      const reader = new S3ItemReader(new S3Client(), s3Params, ".");
      nexts = await collectNexts(reader, 3, { index: 2 });
    });

    it("generates nexts object with the correct content", async () => {
      expect(nexts[0]).toEqual({
        item: "Foo",
        cursor: { index: 3 },
        finished: false
      });
      expect(nexts[1]).toEqual({
        item: "Bar",
        cursor: { index: 4 },
        finished: false
      });
      expect(nexts[2]).toEqual({
        item: "Fiz",
        cursor: { index: 5 },
        finished: true
      });
    });

    it("caches S3 result", async () => {
      expect(s3Mock.calls().length).toBe(1);
    });
  });

  describe("when given path is not an array", () => {
    const nonArrays = [
      { name: "string", value: "Foo" },
      { name: "object", value: { foo: "Foo" } },
      { name: "null", value: null },
      { name: "number", value: 1.0 }
    ];

    nonArrays.forEach(({ name, value }) => {
      it(`throws error when ${name} is found`, async () => {
        s3Mock.on(GetObjectCommand).resolves(createS3Response(value));
        const reader = new S3ItemReader(new S3Client(), s3Params, ".");
        await expect(reader.next()).rejects.toThrow(JSON.stringify(value));
      });
    });

    it(`throws error when undefined is found`, async () => {
      s3Mock.on(GetObjectCommand).resolves(createS3Response("not used"));
      const reader = new S3ItemReader(new S3Client(), s3Params, "non existent");
      await expect(reader.next()).rejects.toThrow("undefined");
    });
  });

  it("throws error when path given Body is not a JSON", async () => {
    s3Mock.on(GetObjectCommand).resolves({
      Body: {
        transformToString: () => Promise.resolve("boom")
      }
    });
    const reader = new S3ItemReader(new S3Client(), s3Params, ".");
    await expect(reader.next()).rejects.toThrow("not a JSON");
  });

  it("hits S3 with the configured parameters", async () => {
    s3Mock.on(GetObjectCommand).resolves(createS3Response(["Foo"]));
    const reader = new S3ItemReader(new S3Client(), s3Params, ".");
    await reader.next();

    const calls = s3Mock.calls();
    expect(calls.length).toBe(1);
    expect(calls[0].args[0].input).toEqual(s3Params);
  });

  it("should be able to process 1000 items", async () => {
    const oneThousand = _.range(1000);
    s3Mock.on(GetObjectCommand).resolves(createS3Response(oneThousand));
    const reader = new S3ItemReader(new S3Client(), s3Params, ".");
    await reduceNexts(reader, 1000, undefined, (next, index) => {
      expect(next).toEqual({
        item: index,
        cursor: { index: index },
        finished: index === _.last(oneThousand)
      });
    });
  });
});
