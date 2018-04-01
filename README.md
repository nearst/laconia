# Laconia

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

Lightweight AWS Lambda framework and library.

## Handler

#### Basic Handler

```javascript
const { basicHandler } = require("laconia-handler");

module.exports.handler = basicHandler(() => "hello");
```

#### Recursive Handler

```javascript
const { recursiveHandler } = require("laconia-handler");

module.exports.handler = recursiveHandler(({ event }, recurse) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 });
  }
});
```

## Batch

#### DynamoDB

```javascript
const { dynamoDbBatchHandler } = require('laconia-batch')

module.exports.handler = dynamoDbBatchHandler({
  readerOptions: {
    operation: 'SCAN',
    dynamoDbParams: {
      TableName: process.env['TABLE_NAME']
    }
  },
  batchOptions: { itemsPerSecond: 2 }
})
}).on("item", ({ event }, item) => processItem(event, item));
```

#### S3

```javascript
const { s3BatchHandler } = require("laconia-batch");

module.exports.handler = s3BatchHandler({
  readerOptions: {
    path: ".",
    s3Params: {
      Bucket: process.env["TEST_BUCKET_NAME"],
      Key: "batch-s3.json"
    }
  },
  batchOptions: { itemsPerSecond: 2 }
}).on("item", ({ event }, item) => processItem(event, item));
```

## Invoke

```javascript
const invoke = require("laconia-invoke");

// Wait for response
invoke("function").requestResponse({ foo: "bar" });

// Do not wait for Lambda invocation
invoke("function").fireAndForget({ foo: "bar" });
```
