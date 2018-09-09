# @laconia/ssm-config

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia SSM - Retrieves parameters and secrets from AWS SSM.

## Features

* **Convention over configuration**: Set environment variables and your parameters and secrets will be made available in `LaconiaContext`

## Install

```
npm install --save @laconia/ssm-config
```

## Usage

Set your lambda environment variable with LACONIA_SSMCONFIG prefix:

```yml
LACONIA_SSMCONFIG_MY_SECRET: /path/to/my/secret
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

## Caching

All of the SSM parameters retrieved are cached by default i.e. subsequent calls to your warm
Lambda will not hit SSM. To understand more on the caching behaviour, go to `@laconia/core`'s
documentation.

### IAM Permissions

Your Lambda is required to have IAM permissions for `SSM:GetParameters` action

### API

#### `ssmConfig.envVarInstances`

Scan all environment variables that starts with LACONIA_SSMCONFIG and
return the derived instances. The name of the instances
will be extracted from the environment variable name, then
converted to camel case.

[SSM#getParameters](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html#getParameters-property)
is used to retrieve the parameters. All parameters are decrypted by default.

Example:

```js
const ssmConfig = require("@laconia/ssm-config");
const laconia = require("@laconia/core");

// LACONIA_SSMCONFIG_SOME_SECRET env var will turn into someSecret
const handler = async ({ someSecret }) => {
  /* logic */
};

module.exports.handler = laconia(handler).register(ssmConfig.envVarInstances());
```
