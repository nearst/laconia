# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.10.0]

### Fixed

- `@laconia/adapter-api`
  - #49 Read websocket body if it's not falsy
    ([@hugosenari](https://github.com/hugosenari))

### Added

- `@laconia/event`
  - #542 Number 'protocol' for laconia-config
    ([@hugosenari](https://github.com/hugosenari)
    [@geoffdutton](https://github.com/geoffdutton))

## [1.9.0]

### Fixed

- `@laconia/core`
  - #48 Add the configuration to suppress callback usage
    ([@hugosenari](https://github.com/hugosenari))

## [1.8.0]

### Added

- `@laconia/adapter-api`
  - #141 Support binary response type
    ([@hugosenari](https://github.com/hugosenari))
- `@laconia/adapter`
  - #152 Create an adapter for DynamoDB event trigger
    ([@sakthivel-tw](https://github.com/sakthivel-tw))

### Fixed

- #269 Various fixes to multiple TypeScript declaration files

## [1.7.0]

### Added

- `@laconia/adapter-api`
  - #156 Add TypeScript declarations
- `@laconia/batch`
  - #130 Start event is now only fired once when batch is starting
    ([@sakthivel-tw](https://github.com/sakthivel-tw))

## [1.6.0]

### Added

- `@laconia/event`
  - #157 Add TypeScript declarations

## [1.5.0]

### Added

- `@laconia/core`
  - #120 Register single dependency
    ([@hugosenari](https://github.com/hugosenari)
    [@geoffdutton](https://github.com/geoffdutton))

## [1.4.0]

### Added

- Ensure laconia is running in Node10.x
  ([@geoffdutton](https://github.com/geoffdutton))
- `@laconia/adapter`
  - #155 Add TypeScript declarations
- `@laconia/invoker`
  - #158 Add TypeScript declarations
- `@laconia/config`
  - #252 Parse JSON which contains a collection of secrets in SecretsManager
    ([@geoffdutton](https://github.com/geoffdutton))
  - #172 Add TypeScript declarations
- `@laconia/batch`
  - #173 Add TypeScript declarations
- `@laconia/laconia-middleware-lambda-warmer`
  - #174 Add TypeScript declarations
- `@laconia/laconia-middleware-serverless-plugin-warmup`
  - #175 Add TypeScript declarations

### Fixes

- `@laconia/config`
  - #252 Only call .convertMultiple if values object is not empty
    ([@geoffdutton](https://github.com/geoffdutton))

## [1.3.0]

### Added

- `@laconia/config`
  - #105 Retrieve secrets from secret manager
    ([@geoffdutton](https://github.com/geoffdutton))

### Fixes

- `@laconia/core`
  - #79 Can't console.log LaconiaContext
- Various improvements in acceptance test

### Changed

- #153 Removed Snyk integration

## [1.2.1]

### Fixes

- `@laconia/event`
  - #51 Handle the headers property being null
    ([@ljcoomber](https://github.com/ljcoomber))
- `@laconia/adapter-api`
  - #50 pass laconiaContext to app in web socket adapter
    ([@Strernd](https://github.com/Strernd))

## [1.2.0]

### Added

- `@laconia/event`
  - #41 WebSocket support ([@Strernd](https://github.com/Strernd))
- `@laconia/adapter-api`
  - #41 WebSocket support ([@Strernd](https://github.com/Strernd))

## [1.1.0]

### Added

- `@laconia/core`
  - #35 Add initial TypeScript declaration files
- Add CONTRIBUTING and CODE_OF_CONDUCT documents

### Fixed

- `@laconia/event`
  - #36 Make API Gateway headers case-insensitive
    ([@ljcoomber](https://github.com/ljcoomber))
- `@laconia/adapter-api`
  - #36 Make API Gateway headers case-insensitive
    ([@ljcoomber](https://github.com/ljcoomber))

## [1.0.0]

- Most API and package names are stabilised and ready to maintain backward
  compatibility
- Add `examples` repo at https://github.com/laconiajs/examples
- Documentation website is now up at https://laconiajs.io/

## [0.19.0]

### Changed

- `@laconia/adapter`
  - **BREAKING** Remove `event` inputType from s3 adapter. You can now use
    `@laconia/event` instead to easily retrieve bucket and key info.

### Added

- `@laconia/event`
  - #26 Expose lower level package for easy creation of custom adapters

## [0.18.0]

### Changed

- `@laconia/event`
  - **BREAKING** #14 Change API usage from event handler to adapter pattern.
    Check out the latest documentation in @laconia/adapter for the latest way to
    use the module
  - Rename package from @laconia/event to @laconia/adapter
- `@laconia/api`
  - Rename package from @laconia/api to @laconia/adapter-api

## [0.17.0]

### Changed

- `@laconia/api`
  - **BREAKING** #13 Change @laconia/api API to abstract business logic instead
    of HTTP. Check out the latest documentation for the latest way to use the
    module.

## [0.16.0]

### Changed

- `@laconia/event`
  - **BREAKING** #12 Change @laconia/event API. Check out the latest
    documentation for the latest way to use the module.

## [0.15.0]

### Changed

- `@laconia/core`
  - **BREAKING** #11 Throw error when unregistered dependencies are referenced
    from LaconiaContext
  - **BREAKING** Remove #run method from laconia.
    - Export your app function separately for unit testing purposes
    - Change unit test usage of #run from `handler.run({ event, dependency })`
      to `app(event, { dependency })`

### Added

- `@laconia/middleware-lambda-warmer`
- `@laconia/middleware-serverless-plugin-warmup`

## [0.14.0]

### Added

- `@laconia/api`
  - Created a new package to support API Gateway events

## [0.13.3]

### Added

- `@laconia/event`
  - Support SNS input converter:
    - snsJson
  - Support SQS input converter:
    - sqsJson

## [0.13.2]

### Added

- `@laconia/event`
  - Support Kinesis input converter:
    - kinesisJson

## [0.13.1]

### Added

- `@laconia/event`
  - Created a new package to support s3 input converter:
    - s3Json
    - s3Stream
    - s3Event

## [0.13.0]

### Changed

- `@laconia/core`
  - **BREAKING** Moved `event` out of `LaconiaContext`. `laconia()` will call
    your handler function with the parameter of `event, LaconiaContext` instead
    of just `LaconiaContext`
    - Change your handler function from `({ event, dependency }) => {}` to
      `(event, { dependency }) => {}`
    - Change unit test usage of #run from `.run({ event, dependency })` to
      `.run(event, { dependency })`

## [0.12.0]

### Added

- `@laconia/config`
  - Merged `@laconia/s3-config` and `@laconia/ssm-config` here.
  - Add boolean conversion support

### Changed

- `@laconia/s3-config`
  - **BREAKING** This package is now merged to `@laconia/config`. Change your
    environment variable from LACONIA_S3CONFIG_VAR: foo to LACONIA_CONFIG_VAR:
    s3:foo
- `@laconia/ssm-config`
  - **BREAKING**This package is now merged to `@laconia/config`. Change your
    environment variable from LACONIA_SSMCONFIG_VAR: foo to LACONIA_CONFIG_VAR:
    ssm:foo

## [0.11.0]

### Added

- `@laconia/core`
  - postProcessor method
- `@laconia/xray`
  - Ability for multiple factories to run concurrently by registering Array

### Changed

- `@laconia/invoker`
  - **BREAKING** Constructor of `invoker` is changed from
    `invoker(functionName, options)` to
    `invoker(functionName, lambda, options)`. The second parameter is an
    instance of AWS.Lambda. Usage of `invoker.envVarInstances` is recommended.

## [0.10.0]

### Added

- `@laconia/core`
  - Ability for multiple factories to run concurrently by registering Array

## [0.9.0]

### Added

- `@laconia/s3-config`
  - New package to retrieve application config from S3

## [0.8.0]

### Changed

- `@laconia/ssm`
  - **BREAKING** Rename environment prefix from LACONIA_SSM\_ to
    LACONIA_SSMCONFIG\_
  - Rename package from @laconia/ssm to @laconia/ssm-config
- `@laconia/invoke`
  - **BREAKING** Rename environment prefix from LACONIA_INVOKE\_ to
    LACONIA_INVOKER\_
  - Rename package from @laconia/invoke to @laconia/invoker as `invoke` is not a
    noun

## [0.7.0]

### Added

- `@laconia/core`
  - Caching support for registered factory

## [0.6.0]

### Changed

- `@laconia/invoke`
  - **BREAKING** Change usage from `invoke.envVarInstances` to
    `invoke.envVarInstances()` for future extensibility
- `@laconia/ssm`
  - **BREAKING** Change usage from `ssm.envVarInstances` to
    `ssm.envVarInstances()` for future extensibility
- `@laconia/test`
  - **BREAKING** Change usage from `spy.instances` to `spy.instances()` for
    future extensibility

## [0.5.0]

### Added

- `@laconia/ssm`
  - Introduce a new package to retrieve parameters and secrets from SSM
  - Add convention over configuration support

### Changed

- **BREAKING** Rename all packages to become scoped packages
  - `laconia-core` becomes `@laconia/core`
  - `laconia-invoke` becomes `@laconia/invoke`
  - `laconia-batch` becomes `@laconia/batch`
  - `laconia-test` becomes `@laconia/test`
- `@laconia/invoke`
  - **BREAKING** Rename `invoke.instances` to `invoke.envVarInstances`

## [0.4.0]

### Added

- `laconia-invoke`
  - Introduce a new package for Lambda invocation which has been extracted out
    from laconia-core
  - Add Convention over configuration support

### Removed

- `laconia-core`
  - invoke and recurse functions from LaconiaContext
  - recurse is now not exposed externally (it is internaly used by
    laconia-batch)
  - invoke can be found in the newly added `laconia-invoke` package

### Changed

- `laconia-core`
  - `laconia` function is now a default export instead of a named export
- `laconia-test`
  - `laconiaTest` function is now a default export instead of a named export
- `laconia-batch`
  - `laconiaBatch` function is now a default export instead of a named export

## [0.3.0]

### Added

- `laconia-test`
  - Introduce a new package for Lambda integration testing

## [0.2.1]

### Changed

- Update README file.

## [0.2.0]

### Added

- Dependency injection support
- Adopt prettier
- FAQ section

### Changed

- Laconia usage patterns now that dependency can be injected
- Change acceptance test to be more realistic (food ordering flow)

### Removed

- Node 6.10 support

## 0.1.0 - 2018-04-06

### Added

- Initial release of laconia-core and laconia-batch

[unreleased]: https://github.com/ceilfors/laconia/compare/v1.10.0...HEAD
[1.10.0]: https://github.com/ceilfors/laconia/compare/v1.9.0...v1.10.0
[1.9.0]: https://github.com/ceilfors/laconia/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/ceilfors/laconia/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/ceilfors/laconia/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/ceilfors/laconia/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/ceilfors/laconia/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/ceilfors/laconia/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/ceilfors/laconia/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/ceilfors/laconia/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/ceilfors/laconia/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ceilfors/laconia/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ceilfors/laconia/compare/v0.19.0...v1.0.0
[0.19.0]: https://github.com/ceilfors/laconia/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/ceilfors/laconia/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/ceilfors/laconia/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/ceilfors/laconia/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/ceilfors/laconia/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/ceilfors/laconia/compare/v0.13.3...v0.14.0
[0.13.3]: https://github.com/ceilfors/laconia/compare/v0.13.2...v0.13.3
[0.13.2]: https://github.com/ceilfors/laconia/compare/v0.13.1...v0.13.2
[0.13.1]: https://github.com/ceilfors/laconia/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/ceilfors/laconia/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/ceilfors/laconia/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/ceilfors/laconia/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/ceilfors/laconia/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/ceilfors/laconia/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/ceilfors/laconia/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/ceilfors/laconia/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/ceilfors/laconia/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/ceilfors/laconia/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/ceilfors/laconia/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ceilfors/laconia/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/ceilfors/laconia/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ceilfors/laconia/compare/v0.1.0...v0.2.0
