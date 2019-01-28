# @laconia/adapter

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Adapter - Converts AWS events into your application input

## Install

```
npm install --save @laconia/adapter
```

## Usage

Use the supported event handlers and you are done!

```js
const laconiaEvent = require("@laconia/adapter").s3Json();

const handler = async (objectRetrievedFromS3, laconiaContext) => {
  // The S3 object that has triggered the event
  console.log(objectRetrievedFromS3);
};

module.exports.handler = laconiaEvent(handler);
```

## Supported event triggers

* S3. Available event handlers:
  * s3Json
  * s3Stream
  * s3Event
* Kinesis. Available event handlers:
  * kinesisJson
* SNS. Available event handlers:
  * snsJson

## API

#### `laconiaEvent.s3Json`

Creates an event handler that will retrieve the object that
has triggered the event from S3, then JSON parses the object.

Example:

```js
const laconiaEvent = require("@laconia/adapter").s3Json();

const handler = async object => {
  console.log(object); // do operation with the object
};

module.exports.handler = laconiaEvent(handler);
```

#### `laconiaEvent.s3Stream`

Creates an event handler that will stream the object that
has triggered the event from S3. See [this AWS documentation](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/requests-using-stream-objects.html)
for more details on the stream.

Example:

```js
const laconiaEvent = require("@laconia/adapter").s3Stream();

const handler = async inputStream => {
  inputStream.pipe(); // do stream operation with the S3 object stream
};

module.exports.handler = laconiaEvent(handler);
```

#### `laconiaEvent.s3Event`

_To reduce your code dependency to AWS, prefer the use of other s3 event handlers before
using `s3Event`. This event handler should only be used when
you don't actually need to retrieve the object from S3, such as listening to
s3:ObjectRemoved:Delete events_

Creates an event handler that will extract S3 event information
into a `S3Event` object, which has the following property:

* `key`: The URL decoded object key
  * The S3 key fired to lambda are URL encoded and hard to be used for AWS SDK S3 operation
* `bucket`: The bucket name

Example:

```js
const laconiaEvent = require("@laconia/adapter").s3Event();

const handler = async s3Event => {
  console.log("Received an event from S3: ", s3Event.bucket, s3Event.key);
};

module.exports.handler = laconiaEvent(handler);
```

#### `laconiaEvent.kinesisJson`

Creates an event handler that will parse kinesis event data from
JSON format into regular object. This event handler will also handle the Kinesis event data format which are
stored in base64 and buried in a nested structure.

Example:

```js
const laconiaEvent = require("@laconia/adapter").kinesisJson();

const handler = async records => {
  console.log(records); // Prints: [{ mykey: 'my value'}]
};

module.exports.handler = laconiaEvent(handler);

// Calls handler with an example Kinesis event
module.exports.handler({
  Records: [
    {
      kinesis: {
        data: "eyJteWtleSI6Im15IHZhbHVlIn0=" // This is the value you'll get from object: { mykey: 'my value' }
      }
    }
  ]
});
```

#### `laconiaEvent.snsJson`

Creates an event handler that will parse sns message from JSON format into regular object.

Example:

```js
const laconiaEvent = require("@laconia/adapter").snsJson();

const handler = async message => {
  console.log(message); // Prints: { mykey: 'my value'}
};

module.exports.handler = laconiaEvent(handler);

// Calls handler with an example SNS event
module.exports.handler({
  Records: [
    {
      Sns: {
        Message: '{"mykey":"my value"}'
      }
    }
  ]
});
```

#### `laconiaEvent.sqsJson`

Creates an event handler that will parse SQS message body from JSON into regular object.

Example:

```js
const laconiaEvent = require("@laconia/adapter").sqsJson();

const handler = async messages => {
  console.log(messages); // Prints: [{ mykey: 'my value'}]
};

module.exports.handler = laconiaEvent(handler);

// Calls handler with an example SQS event
module.exports.handler({
  Records: [
    {
      body: '{"mykey":"my value"}'
    }
  ]
});
```
