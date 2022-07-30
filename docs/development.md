# Development

## Getting Started

1.  Install the node version listed in .tools-version
2.  Run `npm i`  
    This will also run `lerna bootstrap` for you.

## Integration Test

1. Install JRE version that's recommended in [this doc](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html#DynamoDBLocal.DownloadingAndRunning.title), this is required for dynamodb local to run

## Acceptance Test

1.  Generate your AWS Access Key  
    You must have the permission required to provision the stack.
2.  Setup AWS credentials in `~/.aws/credentials`
3.  Run `npm run test:acceptance`  
    This command will deploy the acceptance stack via `serverless framework`,
    then run the acceptance test.

# Release

Ensure everything is running when they're clean first by running:
`npm run clean && npm install && npm run test:all`.

1. Run `npx lerna publish`. This command will do everything for you:

   1. Version update to all packages' package.json
   2. Inter dependency update
   3. Git commit
   4. Git tag creation
   5. NPM package publish to npmjs
   6. Git tag push

2. Update CHANGELOG.md (also the links at the bottom of the file)
