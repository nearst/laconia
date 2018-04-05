# laconia-batch

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia — Micro AWS Lambda framework

Reads large number of records without Lambda time limit.

AWS Lambda maximum execution duration per request is 300 seconds, hence it is
impossible to utilise a Lambda to execute a long running task. `laconia-batch`
handles your batch processing needs by providing a beautifully designed API
which hides the time limitaton problem.

## Documentation

* [Usage](#usage)
* [API Reference](#api)

## Usage

Install laconia-batch using yarn:

```
yarn add laconia-batch
```

Or via npm:

```
npm install --save laconia-batch
```

These are the currently supported input sources:

* DynamoDB
* S3

Example of batch processing by scanning a dynamodb table:

```js
const { dynamoDbBatchHandler } = require('laconia-batch')

module.exports.handler = dynamoDbBatchHandler({
  readerOptions: {
    operation: 'SCAN',
    dynamoDbParams: {
      TableName: 'RecordsTable'
    }
  },
  batchOptions: { itemsPerSecond: 2 }
}).on('item', ({ event }, item) => processItem(event, item))
```

Rate limiting is supported out of the box by setting the `batchOptions.itemsPerSecond`
option.

### How it works

`laconia-batch` works around the Lambda's time limitation by using recursion.
It will automatically recurse when Lambda timeout is about to happen, then resumes
from where it left off in the new invocation.

Imagine if you are about to process the array [1, 2, 3, 4, 5] and each requests can only
handle two items, the following will happen:

* request 1: Process 1
* request 1: Process 2
* request 1: Not enough time, recursing with current cursor
* request 2: Process 3
* request 2: Process 4
* request 2: Not enough time, recursing with current cursor
* request 3: Process 5

## API

### `dynamoDbBatchHandler({readerOptions, [batchOptions]})`

Reads items from Dynamo DB table.

readerOptions:

* `operation`
  * _Mandatory_
  * Valid values are: `'SCAN'` and `'QUERY'`
* `dynamoDbParams`
  * _Mandatory_
  * This parameter is used when documentClent's operations are called
  * `ExclusiveStartKey` param can't be used as it will be overridden in the processing time!
* `documentClient = new AWS.DynamoDB.DocumentClient()`
  * _Optional_
  * Set this option if there's a need to cutomise the AWS.DynamoDB.DocumentClient instantation
  * Used for DynamoDB operation

Example:

```js
// Scans the entire Music table
dynamoDbBatchHandler({
  readerOptions: {
    operation: 'SCAN',
    dynamoDbParams: { TableName: 'Music' }
  }
})

// Queries Music table with a more complicated DynamoDB parameters
dynamoDbBatchHandler({
  readerOptions: {
    operation: 'QUERY',
    dynamoDbParams: {
      TableName: 'Music',
      Limit: 1,
      ExpressionAttributeValues: {
        ':a': 'Bar'
      },
      FilterExpression: 'Artist = :a'
    }
  }
})
```

### `s3BatchHandler({readerOptions, [batchOptions]})`

Reads items from an array stored in s3.

readerOptions:

* `path`
  * _Mandatory_
  * The path to the array to be processed
  * Set to `'.'` if the object stored in s3 is the array
  * Set to a path if an object is stored in s3 and the array is a property of the object
    * `lodash.get` is used to retrieve the array
* `s3Params`
  * _Mandatory_
  * This parameter is used when `s3.getObject` is called to retrieve the array stored in s3
* `s3 = new AWS.S3()`
  * _Optional_
  * Set this option if there's a need to cutomise the AWS.S3 instantation
  * Used for S3 operation

Example:

```js
// Reads an array from array.json in MyBucket
s3BatchHandler({
  readerOptions: {
    path: '.',
    s3Params: {
      Bucket: 'MyBucket',
      Key: 'array.json'
    }
  }
})

// Reads the array retrieved at database.music[0]["category"].list from object.json in MyBucket
s3BatchHandler({
  readerOptions: {
    path: 'database.music[0]["category"].list',
    s3Params: {
      Bucket: 'MyBucket',
      Key: 'object.json'
    }
  }
})
```

### Batch options

_This is a shared behaviour to all the batch handlers._

batchOptions available:

* `itemsPerSecond`
  * _Optional_
  * Rate limit will not be applied if value is not set
  * Can be set to decimal, i.e. 0.5 will equate to 1 item per 2 second.
* `timeNeededToRecurseInMillis`
  * _Optional_
  * The value set here will be used to check if the current execution is to be stopped
  * If you have a _very slow_ item processing, the batch processor might not have enough time
    to recurse and your Lambda execution might be timing out. You can increase this value to
    increase the chance of the the recursion to happen

Example:

```js
dynamoDbBatchHandler({
  ...
  batchOptions: {
    itemsPerSecond,
    timeNeededToRecurseInMillis = 5000
  }
})
```

### Events

_This is a shared behaviour to all the batch handlers._

There are events that you can listen to when `laconia-batch` is working.

* item: `laconiaContext, item`
  * Fired on every item read.
  * `item` is an object found during the read
  * `laconiaContext` can be destructured to `{event, context}`
* start: `laconiaContext`
  * Fired when the batch process is started for the very first time
  * `laconiaContext` can be destructured to `{event, context}`
* stop: `laconiaContext, cursor`
  * Fired when the current execution is timing out and about to be recursed
  * `cursor` contains the information of how the last item is being read
  * `laconiaContext` can be destructured to `{event, context}`
* end: `laconiaContext`
  * Fired when the batch processor can no longer find any more records
  * `laconiaContext` can be destructured to `{event, context}`

Example:

```js
dynamoDbBatchHandler({ ... })
.on('start', (laconiaContext) => ... )
.on('item', (laconiaContext, item) => ... )
.on('stop', (laconiaContext, cursor) => ... )
.on('end', (laconiaContext) => ... )
```
