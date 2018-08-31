# @laconia/ssm

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia SSM - Retrieves parameters and secrets from AWS SSM.

## Features

* **Convention over configuration**: Set environment variables and your parameters and secrets will be made available in `LaconiaContext`

## Install

```
npm install --save @laconia/ssm
```

## Usage

Set your lambda environment variable:

```yml
LACONIA_SSM_MY_SECRET: /path/to/my/secret
```

`@laconia/ssm` will scan all environment variables that start with LACONIA_SSM and
inject the retrieved SSM parameters to `LaconiaContext`. The name of the instances
will be extracted from the environment variable name, then
converted to camel case. The instance you'll get in your `LaconiaContext` from the above configuration will be
`mySecret`:

```js
const ssm = require("@laconia/ssm");
const laconia = require("@laconia/core");

const handler = async ({ mySecret }) => {
  // use mySecret
};

module.exports.handler = laconia(handler).register(ssm.envVarInstances);
```

All SSM parameters are decrypted by default.

### API

#### `ssm.envVarInstances`

Scans environment variables set in the current Lambda and automatically
retrieves parameters from SSM. [SSM#getParameters](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html#getParameters-property)
is used to retrieve the parameters. All parameters are decrypted by default.

Example:

```js
const ssm = require("@laconia/ssm");
const laconia = require("@laconia/core");

const handler = async ({ someSecret }) => {
  /* logic */
};

module.exports.handler = laconia(handler).register(invoke.envVarInstances);
```
