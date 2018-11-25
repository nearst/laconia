# @laconia/event

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Event - Converts AWS events into non-AWS or humane format

## Install

```
npm install --save @laconia/event
```

## Usage

Register the supported event source and you are done!

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async (s3Object, laconiaContext) => {
  // The S3 object that has triggered the event
  console.log(s3Object);
};

module.exports.handler = laconia(handler).register(event.s3Json());
```

## Types of supported event triggers

* S3. Available input converters:
  * s3Json
  * s3Stream
  * s3Event
* Kinesis. Available input converters:
  * kinesisJson
* Sns. Available input converters:
  * snsJson

## API

#### `event.s3Json`

Creates an instance of `inputConverter` that will retrieve the object that
has triggered the event from S3, then JSON parses the object.

Example:

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async object => {
  console.log(object); // do operation with the object
};

module.exports.handler = laconia(handler).register(event.s3Json());
```

#### `event.s3Stream`

Creates an instance of `inputConverter` that will stream the object that
has triggered the event from S3. See [this AWS documentation](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/requests-using-stream-objects.html)
for more details on the stream.

Example:

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async inputStream => {
  inputStream.pipe(); // do stream operation with the S3 object stream
};

module.exports.handler = laconia(handler).register(event.s3Stream());
```

#### `event.s3Event`

_To reduce your code dependency to AWS, prefer the use of other s3 `inputConverters` before
using `s3Event` inputConverter. This inputConverter should only be used when
you don't actually need to retrieve the object from S3, such as listening to
s3:ObjectRemoved:Delete events_

Creates an instance of `inputConverter` that will extract S3 information
into a `S3Event` object, which has the following property:

* `key`: The URL decoded object key
  * The S3 key fired to lambda are URL encoded and hard to be used for AWS SDK S3 operation
* `bucket`: The bucket name

Example:

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async s3Event => {
  console.log("Received an event from S3: ", s3Event.bucket, s3Event.key);
};

module.exports.handler = laconia(handler).register(event.s3());
```

#### `event.kinesisJson`

Creates an instance of `inputConverter` that will parse kinesis event data into
JSON format. The `inputConverter` will also handle the Kinesis event data format which are
stored in base64 and buried in a nested structure.

Example:

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async records => {
  console.log(records); // Prints: [{ mykey: 'my value'}]
};

module.exports.handler = laconia(handler).register(event.kinesisJson());

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

#### `event.snsJson`

Creates an instance of `inputConverter` that will parse sns message into
JSON format.

Example:

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async message => {
  console.log(message); // Prints: { mykey: 'my value'}
};

module.exports.handler = laconia(handler).register(event.snsJson());

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

#### `event.sqsJson`

Creates an instance of `inputConverter` that will parse SQS message body into JSON format.

Example:

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async messages => {
  console.log(messages); // Prints: [{ mykey: 'my value'}]
};

module.exports.handler = laconia(handler).register(event.sqsJson());

// Calls handler with an example SQS event
module.exports.handler({
  Records: [
    {
      body: '{"mykey":"my value"}'
    }
  ]
});
```
