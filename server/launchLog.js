var states = 3
var state = 0

if (process.env.UPDATE_ROLES) states++

module.exports = {
  log: text => {
    state++
    console.log(
      `[${state}/${states}] ${text}${state == states ? '. OK!' : '...'}`,
    )
  },
}
