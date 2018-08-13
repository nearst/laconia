# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/ceilfors/laconia/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/ceilfors/laconia/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ceilfors/laconia/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/ceilfors/laconia/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ceilfors/laconia/compare/v0.1.0...v0.2.0
