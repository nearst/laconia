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

const handler = async object => {
  // The S3 object that has triggered the event
  console.log(object);
};

module.exports.handler = laconia(handler).register(event.s3Json());
```

## Types of event source

These are the supported event sources:

* S3
  * s3Json
  * s3Stream
  * s3Event

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
using `s3Event` inputConverter to reduce your code dependency to AWS_

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
