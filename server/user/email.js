const { passwordResetToken } = require('./token')
const { confirmationEmailTemplate, passwordResetTemplate } = require('./config')
const { parseDomain, getProjectName } = require('../domains')

const mailgun = require('mailgun-js')

// const senderEmail = () => `Localhost Service <noreply@trader-bull.com>`
const senderEmail = url => `${getProjectName(url)} Service <noreply@${parseDomain(url)}>`

const createTransport = url => {
  return mailgun({
    apiKey: process.env.MG_API_KEY,
    // domain: 'trader-bull.com',
    domain: parseDomain(url),
  })
}

module.exports = {
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
      return createTransport(url).sendMail({
        from: senderEmail(url),
        to,
        subject: 'Password Reset Requested',
        html: passwordResetTemplate(resetUrl),
      })
    }
  },
}
