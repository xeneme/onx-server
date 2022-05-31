const { passwordResetToken } = require('./token')
const { confirmationEmailTemplate, passwordResetTemplate } = require('./config')
const { parseDomain, getProjectName } = require('../domains')

const mailgun = require('mailgun-js')

const senderEmail = url => `${getProjectName(url)} Service <noreply@${parseDomain(url)}>`
const confirmationEnabled = url => {
  if (process.env.DISABLE_EMAILS) return false
  return !['eucurrencycrypto.com', 'eucryptobit.com', 'euexchange.pw', 'localhost'].includes(parseDomain(url))
}

const createTransport = url => {
  return mailgun({
    apiKey: process.env.MG_API_KEY,
    domain: parseDomain(url),
  })
}

module.exports = {
  confirmationEnabled,
  send: (url, to, code) => {
    return createTransport(url)
      .messages()
      .send({
        from: senderEmail(url),
        to,
        subject: 'Email Confirmation',
        html: confirmationEmailTemplate(code, url),
      })
  },
  passwordResetEmail: (url, to, userID) => {
    const token = passwordResetToken({ userID, reset: true })
    const resetUrl = `${url}/reset?token=` + token

    if (url == 'http://localhost:8080') {
      console.log('Password reset URL code is', resetUrl)
      return Promise.resolve()
    } else {
      return createTransport(url).messages()
        .send({
          from: senderEmail(url),
          to,
          subject: 'Password Reset Requested',
          html: passwordResetTemplate(resetUrl),
        })
    }
  },
}
