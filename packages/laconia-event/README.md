# @laconia/event

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Event - Extracts and converts AWS events into friendlier format

## Install

```
npm install --save @laconia/event
```

## Usage

Register the supported event source and you are done!

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async s3Event => {
  console.log(s3Event.key); // No awkward navigation and URL decoding from event.Records[0].s3.object.key;
  console.log(s3Event.bucket); // No awkward navigation and URL decoding from event.Records[0].s3.object.bucket
  console.log(await s3Event.getJson()); // Retrieve the stored JSON object from S3 instantly
};

module.exports.handler = laconia(handler).register(event.s3());
```

## Types of event source

These are the supported event sources:

* s3

## API

#### `event.s3`

Creates an instance of `inputConverter` that will extract S3 information
into a `S3Event` object, which has the following property:

* `key`: The URL decoded object key
  * The S3 key fired to lambda are URL encoded and hard to be used for AWS SDK S3 operation
* `bucket`: The bucket name
* `getJson()`: Returns the associated JSON object stored in S3

Example:

```js
const laconia = require("@laconia/core");
const event = require("@laconia/event");

const handler = async s3Event => {
  console.log("Received an event from S3: ", s3Event.bucket, s3Event.key);
  const json = await s3Event.getJson());
  // do some operation with json object retrieved
};

module.exports.handler = laconia(handler).register(event.s3());
```
