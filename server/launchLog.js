var states = 4,
  state = 0,
  callbackExecuted = false,
  callback = null

if (process.env.UPDATE_ROLES) states++
if (process.env.SYNC_WALLETS) states++

module.exports = {
  log: (text, cb) => {
    state++

    if (cb) callback = cb

    console.log(
      `[${state}/${states}] ${text}${
        state == states + +Boolean(callback) ? '.' : '...'
      }`,
    )

    if (state == states && !callback) {
      console.log('\n-------- OK! --------\n')
    }

    if (state == states - +Boolean(callback) && !callbackExecuted && callback) {
      callback()
      callbackExecuted = true
    }
  },
  sublog: text => {
    console.log(' -- ' + text)
  },
}
