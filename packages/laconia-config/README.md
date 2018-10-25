# @laconia/config

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Config - Externalizes application secret and configuration

## Install

```
npm install --save @laconia/config
```

## Usage

Set your lambda environment variable with LACONIA_CONFIG prefix:

```yml
LACONIA_SSMCONFIG_MY_SECRET: ssm:/path/to/my/secret
```

`/path/to/my/secret` parameter will be retrieved from SSM, decrypted, and made available as
`mySecret` in your `LaconiaContext`:

```js
const ssmConfig = require("@laconia/ssm-config");
const laconia = require("@laconia/core");

const handler = async ({ mySecret }) => {
  // use mySecret
};

module.exports.handler = laconia(handler).register(ssmConfig.envVarInstances());
```

## Types of config source

These are the supported configuration sources that you can use when setting
an environment variable with LACONIA_CONFIG prefix:

* ssm: Retrieves parameters and secrets from AWS SSM

  * Format: ssm:[parameter name]
  * Example: ssm:/path/to/my/secret

* s3: Retrieves application config from S3

  * Format: s3:[bucket]/[key].json
  * Example: s3:bucketName/path/to/config.json

* boolean: Converts truthy/falsy values to boolean. Developers often forget that the environment variables they set in Lambdas are actually String values.

  * Format: boolean:[truthy / falsy values]
  * Example: boolean:off

  @laconia/config will trim, ignore case, and convert these falsy values to `false`, otherwise to `true`:

  * false
  * null
  * undefined
  * 0
  * no
  * n
  * off
  * (empty string)

## Caching

All of the SSM parameters retrieved are cached by default i.e. subsequent calls to your warm
Lambda will not hit SSM. To understand more on the caching behaviour, go to `@laconia/core`'s
documentation.

### API

#### `config.envVarInstances`

Scan all environment variables that starts with LACONIA_CONFIG and
return the derived values.

Example:

```js
const config = require("@laconia/config");
const laconia = require("@laconia/core");

// LACONIA_CONFIG_SOME_SECRET env var will turn into someSecret
const handler = async ({ someSecret }) => {
  /* logic */
};

module.exports.handler = laconia(handler).register(config.envVarInstances());
```
