# @laconia/s3-config

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia S3 Config - Retrieves application config from S3

## Features

* **Convention over configuration**: Set environment variables and your application config will be made available in `LaconiaContext`

## Install

```
npm install --save @laconia/s3-config
```

## Usage

Set your lambda environment variable with LACONIA_S3CONFIG prefix:

```yml
LACONIA_S3CONFIG_MY_CONFIG: bucketName/path/to/config.json
```

`config.json` will be retrieved from S3, parsed, and made available as `myconfig` in your `LaconiaContet`:

```js
const s3Config = require("@laconia/s3-config");
const laconia = require("@laconia/core");

const handler = async ({ myConfig }) => {
  // use myConfig
};

module.exports.handler = laconia(handler).register(s3Config.envVarInstances());
```

Only JSON file is supported at the moment.

### IAM Permissions

Your Lambda is required to have IAM permissions for `s3:GetObject` action

### API

#### `s3Config.envVarInstances`

Scan all environment variables that starts with LACONIA_S3CONFIG and
return the derived instances. The object will automatically be parsed to javascript
object. The name of the instances will be extracted from the environment variable name,
then converted to camel case.

Example:

```js
const s3Config = require("@laconia/s3-config");
const laconia = require("@laconia/core");

// LACONIA_S3CONFIG_MY_CONFIG env var will turn into myConfig
const handler = async ({ myConfig }) => {
  /* logic */
};

module.exports.handler = laconia(handler).register(s3Config.envVarInstance());
```
