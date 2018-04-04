# laconia-core

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia is a lightweight AWS Lambda development framework that brings focus back on your real work.

Reduces boilerplate Lambda code.

## Documentation

* [Usage](#usage)
* [API Reference](#api)

## Usage

Install Jest using yarn:

```
yarn add laconia-core
```

Or via npm:

```
npm install --save laconia-core
```

### Basic Handler

Promisifies Lambda handler. Never forget to call AWS
Lambda's `callback` anymore. This is the base of all Laconia handlers.

Value returned in the `fn` will be used for the Lambda callback.
If a promise is returned, the resolved value will be used
for the Lambda callback as well. When an error occured, both in sync and async scenario, the error
will properly be propagated to Lambda callback.

```js
const { basicHandler } = require('laconia-core')

module.exports.handler = basicHandler(() => 'hello')
```

### Recursive Handler

Provides convenience `recurse` function that will recurse the running Lambda
with the provided `payload`.

```js
const { recursiveHandler } = require('laconia-core')

module.exports.handler = recursiveHandler(({ event }, recurse) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 })
  }
})
```

## API

### `basicHandler(fn)`

* `fn(laconiaContext)`
  * This `Function` is called when your Lambda is invoked
  * Will be called with `laconiaContext` object, which can be destructured to `{event, context}`
  * `return` value will be returned to the Lambda caller
  * `return` a Promise and it will be handled appopriately

Example:

```js
// Simple return value
basicHandler(() => 'value')

// Return a promise and 'value' will be returned to the Lambda caller
basicHandler(() => Promise.resolve('value'))
```

### `recursiveHandler(fn)`

* `fn(laconiaContext, recurse)`

  * This `Function` is called when your Lambda is invoked
  * Will be called with `laconiaContext` object, which can be destructured to `{event, context}`
  * `recurse(payload = {})`
    * This `Function` can be called to recurse the Lambda
    * `payload` will be made available in the invoked Lambda's `event` object
    * Do not call this function to stop the recursion

Example:

```js
recursiveHandler(({ event }, recurse) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 })
  }
})
```
