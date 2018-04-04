const { laconia, recurse } = require('laconia-core')
const tracker = require('laconia-test-helper').tracker('recursive')

module.exports.handler = laconia(({ event }) => {
  return tracker.tick()
    .then(_ => {
      if (event.input !== 3) {
        return recurse({ input: event.input + 1 })
      }
    })
})
