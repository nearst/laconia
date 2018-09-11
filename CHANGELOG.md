# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.0]

### Added

* `@laconia/core`
  * Ability for multiple factories to run concurrently by registering Array

## [0.9.0]

### Added

* `@laconia/s3-config`
  * New package to retrieve application config from S3

## [0.8.0]

### Changed

* `@laconia/ssm`
  * **BREAKING** Rename package from @laconia/ssm to @laconia/ssm-config
  * **BREAKING** Rename environment prefix from LACONIA_SSM\_ to LACONIA_SSMCONFIG\_
* `@laconia/invoke`
  * **BREAKING** Rename package from @laconia/invoke to @laconia/invoker as `invoke` is not a noun
  * **BREAKING** Rename environment prefix from LACONIA_INVOKE\_ to LACONIA_INVOKER\_

## [0.7.0]

### Added

* `@laconia/core`
  * Caching support for registered factory

## [0.6.0]

### Changed

* `@laconia/invoke`
  * **BREAKING** Change usage from `invoke.envVarInstances` to `invoke.envVarInstances()` for future extensibility
* `@laconia/ssm`
  * **BREAKING** Change usage from `ssm.envVarInstances` to `ssm.envVarInstances()` for future extensibility
* `@laconia/test`
  * **BREAKING** Change usage from `spy.instances` to `spy.instances()` for future extensibility

## [0.5.0]

### Added

* `@laconia/ssm`
  * Introduce a new package to retrieve parameters and secrets from SSM
  * Add convention over configuration support

### Changed

* **BREAKING** Rename all packages to become scoped packages
  * `laconia-core` becomes `@laconia/core`
  * `laconia-invoke` becomes `@laconia/invoke`
  * `laconia-batch` becomes `@laconia/batch`
  * `laconia-test` becomes `@laconia/test`
* `@laconia/invoke`
  * **BREAKING** Rename `invoke.instances` to `invoke.envVarInstances`

## [0.4.0]

### Added

* `laconia-invoke`
  * Introduce a new package for Lambda invocation which has been extracted out from laconia-core
  * Add Convention over configuration support

### Removed

* `laconia-core`
  * invoke and recurse functions from LaconiaContext
  * recurse is now not exposed externally (it is internaly used by laconia-batch)
  * invoke can be found in the newly added `laconia-invoke` package

### Changed

* `laconia-core`
  * `laconia` function is now a default export instead of a named export
* `laconia-test`
  * `laconiaTest` function is now a default export instead of a named export
* `laconia-batch`
  * `laconiaBatch` function is now a default export instead of a named export

## [0.3.0]

### Added

* `laconia-test`
  * Introduce a new package for Lambda integration testing

## [0.2.1]

### Changed

* Update README file.

## [0.2.0]

### Added

* Dependency injection support
* Adopt prettier
* FAQ section

### Changed

* Laconia usage patterns now that dependency can be injected
* Change acceptance test to be more realistic (food ordering flow)

### Removed

* Node 6.10 support

## 0.1.0 - 2018-04-06

### Added

* Initial release of laconia-core and laconia-batch

[unreleased]: https://github.com/ceilfors/laconia/compare/v0.10.0...HEAD
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
