const _ = require("lodash");

const yields = response => (params, callback) => {
  if (typeof response !== "function") {
    callback(null, response);
  } else {
    callback(null, response(params));
  }
};

const s3Body = object =>
  yields({
    Body: {
      toString: () => JSON.stringify(object)
    }
  });

const reduceNexts = async (reader, times, startingCursor, callback) => {
  await _.range(times).reduce(async (cursorPromise, index) => {
    const cursor = await cursorPromise;
    const next = await reader.next(cursor);
    callback(next, index);
    return next.cursor;
  }, startingCursor);
};

const collectNexts = async (reader, times, startingCursor) => {
  let nexts = [];
  await reduceNexts(reader, times, startingCursor, next => nexts.push(next));
  return nexts;
};

const getTimestampGaps = jestFn => {
  const timestamps = jestFn.timestamps;
  return timestamps.slice(1).map((val, index) => val - timestamps[index]);
};

const recordTimestamps = jestFn => () => {
  if (!jestFn.timestamps) {
    jestFn.timestamps = [];
  }
  jestFn.timestamps.push(Date.now());
};

const matchers = {
  toBeCalledWithGapBetween(jestFn, minimum, maximum) {
    const gaps = getTimestampGaps(jestFn);
    gaps.forEach(gap => {
      expect(gap).toBeGreaterThanOrEqual(minimum);
      expect(gap).toBeLessThanOrEqual(maximum);
    });
    return { pass: true };
  }
};

const asyncAttempt = async func => {
  let result;
  let error = null;
  try {
    result = await func();
  } catch (e) {
    error = e;
  }

  return [error, result];
};

exports.yields = yields;
exports.s3Body = s3Body;
exports.collectNexts = collectNexts;
exports.reduceNexts = reduceNexts;
exports.matchers = matchers;
exports.recordTimestamps = recordTimestamps;
exports.tracker = require("./tracker");
exports.asyncAttempt = asyncAttempt;
