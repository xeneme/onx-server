require('colors')

/* prettier-ignore */
var states = 4,
    state = 0,
    callbackExecuted = false,
    callback = null,
    error = 0

if (process.env.UPDATE_ROLES) states++
if (process.env.SYNC_WALLETS) states++

module.exports = {
  log: (text, cb) => {
    if(error) return

    state++

    if (cb) callback = cb

    console.log(
      ` [${state}/${states}] `.bgCyan + ` ${text}${
        state == states + +Boolean(callback) ? '.' : '...'
      }`,
    )

    if (state == states && !callback) {
      console.log()
      console.log(' OK! '.bgBrightWhite + 'The application is up and running.')
      console.log()
    } else if (state == states - +Boolean(callback) && !callbackExecuted && callback) {
      callback(() => {
        console.log()
        console.log(' OK! '.bgBrightGreen.black + ' Your server is up and running.')
        console.log()
        callbackExecuted = true
      })
    }
  },
  sublog: text => {
    console.log('          ' + text)
  },
  error(err) {
    console.log('\n ERR '.bgBrightRed.black + ' ' + err)
    error = 1
  },
}
