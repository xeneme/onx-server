const { passwordResetToken } = require('./token')
const { confirmationEmailTemplate, passwordResetTemplate } = require('./config')
const { parseDomain, getProjectName } = require('../domains')

const mailgun = require('mailgun-js')

// const senderEmail = () => `Bithonium Support <support@bithonium.com>`
const senderEmail = url => `${getProjectName(url)} Service <noreply@${parseDomain(url)}>`
const confirmationEnabled = url => !['eucurrencycrypto.com'].includes(parseDomain(url))

const createTransport = url => {
  return mailgun({
    apiKey: process.env.MG_API_KEY,
    // domain: 'bithonium.com',
    domain: parseDomain(url),
  })
}

// createTransport()
  // .messages()
  // .send({
    // from: senderEmail(),
    // to: 'dovranbabayev101@gmail.com',
    // subject: 'Support team',
    // text: `Hello! Thanks for your contact with customer service! You can get your account verified for 1LTC after your account will be secured with 2FA authentication. Unfortunately, this is the only way to reduce the size of the first minimum deposit.`,
  // }).then(d => {
    // console.log(d)
  // })
  // .catch(e => {
    // console.log(e.message)
  // })

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
