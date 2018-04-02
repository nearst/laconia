# Laconia

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

Lightweight AWS Lambda development framework that brings focus back
to your real work. It provides well tested solution and better developer experience.

The following modules are available as NPM packages:

* laconia-handler: Reduces boilerplate Lambda code.
* laconia-batch: Reads large number of records without time limits.
* laconia-invoke: Improves the user experience of invoking Lambda.

## Usages

### Handler

#### Basic Handler

Promisifies Lambda handler. Never forget to call AWS
Lambda's `callback` anymore. This is the base of all Laconia handlers.

```javascript
const { basicHandler } = require('laconia-handler')

module.exports.handler = basicHandler(() => 'hello')
```

#### Recursive Handler

Provides convenience `recurse` function that will recurse the running Lambda.

```javascript
const { recursiveHandler } = require('laconia-handler')

module.exports.handler = recursiveHandler(({ event }, recurse) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 })
  }
})
```

### Batch

#### DynamoDB

Reads large number of items from DynamoDB without time limits.
This handler will automatically recurse when Lambda timeout is about to happen,
then resumes from where it left off in the new invocation. 'item' event
will be fired on every items.

```javascript
const { dynamoDbBatchHandler } = require('laconia-batch')

module.exports.handler = dynamoDbBatchHandler({
  readerOptions: {
    operation: 'SCAN',
    dynamoDbParams: {
      TableName: 'RecordsTable'
    }
  },
  batchOptions: { itemsPerSecond: 2 } // Rate limits item read
}).on('item', ({ event }, item) => processItem(event, item))
```

#### S3

Similar to dynamoDbBatchHandler, but for reading an array from S3.
The following code will read the array stored in records.json.

```javascript
const { s3BatchHandler } = require('laconia-batch')

module.exports.handler = s3BatchHandler({
  readerOptions: {
    path: '.',
    s3Params: {
      Bucket: 'my-bucket',
      Key: 'records.json'
    }
  },
  batchOptions: { itemsPerSecond: 2 }
}).on('item', ({ event }, item) => processItem(event, item))
```

### Invoke

Provides improved and more predictable user experience of invoking other Lambda by:

* Automatically stringifying the JSON payload
* Throwing an error when FunctionError is returned
* Throwing an error when statusCode returned is not expected

```javascript
const invoke = require('laconia-invoke')

// Waits for Lambda response before continuing
await invoke('function-name').requestResponse({ foo: 'bar' })

// Invokes a Lambda and not wait for it to return
await invoke('function-name').fireAndForget({ foo: 'bar' })
```
