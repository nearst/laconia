# @laconia/config

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Config - Converts truthy and falsy environment variables to boolean

`@laconia/boolean-config` aims to make setting boolean environment variables less error prone.
A lot of times developers forget that the environment variables they set in Lambdas are actually String.

## Install

```
npm install --save @laconia/boolean-config
```

## Usage

Set your lambda environment variable with LACONIA_BOOLEANCONFIG prefix:

```yml
LACONIA_BOOLEANCONFIG_FLAG: true
```

```js
const booleanConfig = require("@laconia/boolean-config");
const laconia = require("@laconia/core");

const handler = async ({ flag }) => {
  // use mySecret
};

module.exports.handler = laconia(handler).register(
  booleanConfig.envVarInstances()
);
```

## Caching

All of the SSM parameters retrieved are cached by default i.e. subsequent calls to your warm
Lambda will not hit SSM. To understand more on the caching behaviour, go to `@laconia/core`'s
documentation.

### API

#### `booleanConfig.envVarInstances`

Scan all environment variables that starts with LACONIA_BOOLEANCONFIG and
return the truthy or falsy instances.
Example:

```js
const booleanConfig = require("@laconia/boolean-config");
const laconia = require("@laconia/core");

// LACONIA_BOOLEANCONFIG_SOME_SECRET env var will turn into flag
const handler = async ({ flag }) => {
  /* logic */
};

module.exports.handler = laconia(handler).register(
  booleanConfig.envVarInstances()
);
```
