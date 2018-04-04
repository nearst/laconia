const { recursiveHandler } = require('laconia-core')
const tracker = require('laconia-test-helper').tracker('recursive')

module.exports.handler = recursiveHandler(({ event }, recurse) => {
  return tracker.tick()
    .then(_ => {
      if (event.input !== 3) {
        return recurse({ input: event.input + 1 })
      }
    })
})
