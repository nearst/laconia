# laconia-invoke

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia is a lightweight AWS Lambda development framework that brings focus back on your real work.

Improves the user experience of invoking Lambdas.

`laconia-invoke` provides improved and more predictable user experience of invoking other Lambda by:

* Automatically stringifying the JSON payload
* Throwing an error when FunctionError is returned
* Throwing an error when statusCode returned is not expected

## Documentation

* [Usage](#usage)
* [API Reference](#api)

## Usage

Install Jest using yarn:

```
yarn add laconia-invoke
```

Or via npm:

```
npm install --save laconia-invoke
```

Quick start:

```js
const invoke = require('laconia-invoke')

// Waits for Lambda response before continuing
await invoke('function-name').requestResponse({ foo: 'bar' })

// Invokes a Lambda and not wait for it to return
await invoke('function-name').fireAndForget({ foo: 'bar' })
```

## API

### `constructor(functionName, options)`

* `functionName` specifies the Lambda function name that will be invoked
* `options`:
  * `lambda = new AWS.Lambda()`
    * _Optional_
    * Set this option if there's a need to cutomise the AWS.Lambda instantation
    * Used for Lambda invocation

Example:

```js
// Customise AWS.Lambda instantiation
invoke('name', {
  lambda: new AWS.Lambda({ apiVersion: '2015-03-31' })
})
```

### `requestResponse(payload)`

Synchronous Lambda invocation.

* `payload`
  * The payload used for the Lambda invocation

Example:

```js
invoke('fn').requestResponse({ foo: 'bar' })
```

### `fireAndForget(payload)`

Asynchronous Lambda invocation.

* `payload`
  * The payload used for the Lambda invocation

Example:

```js
invoke('fn').fireAndForget({ foo: 'bar' })
```
