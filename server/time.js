const getLocale = () => {
  return +new Date()
}

const getPacific = () => {
  let offset = new Date().getTimezoneOffset() * 60 * 1000
  return getLocale() + offset
}

const getExpiration = (from, additionalMinutes) => {
  let min = typeof additionalMinutes === 'number' ? additionalMinutes : 0
  return from + 1000 * 60 * min
}

const localeToPacific = locale => {
  let offset = new Date().getTimezoneOffset() * 60 * 1000
  return locale + offset
}

const pacificToLocale = pacific => {
  let offset = new Date().getTimezoneOffset() * 60 * 1000
  return pacific - offset
}

module.exports = {
  getPacific,
  getLocale,
  getExpiration,
  localeToPacific,
  pacificToLocale,
}
