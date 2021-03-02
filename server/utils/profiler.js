require('colors')

const Timer = (prompt = '') => ({
  timings: {},
  startTime: +new Date(),
  tap(where) {
    this.timings[where] = (+new Date() - this.startTime) / 1000 + 's'
  },
  flush() {
    const s = Object.entries(this.timings)
      .map(([where, t]) => where + '(' + t + ')')
      .join(', ')

    console.log(` ${prompt} REQUEST PROFILE - ${s}`.gray)
  },
})

module.exports = {
  Timer,
}
