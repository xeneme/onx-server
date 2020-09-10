var states = 3
var state = 0

if (process.env.UPDATE_ROLES) states++
if (process.env.SYNC_WALLETS) states++

module.exports = {
  log: text => {
    state++
    console.log(
      `[${state}/${states}] ${text}${state == states ? '. OK!' : '...'}`,
    )
  },
}
