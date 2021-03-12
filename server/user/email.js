const { passwordResetToken } = require('./token')
const { confirmationEmailTemplate, passwordResetTemplate } = require('./config')
const { parseDomain } = require('../domains')

const nodemailer = require('nodemailer')
const mailgun = require('mailgun-js')

const supportEmail = url => 'support@' + parseDomain(url)
// const supportEmail = url => 'support@trader-bull.com'

const createTransport = url => {
  // const user = supportEmail(url)
  // const { SUPPORT_PASS: pass } = process.env

  return mailgun({
    apiKey: 'b4b48a2c35fea8be3f6a0e8a75e67492-29561299-56d703e5',
    domain: parseDomain(url),
    // domain: 'trader-bull.com',
  })

  // return nodemailer.createTransport({
  //   host: '151.248.118.134',
  //   port: 25,
  //   secure: false,
  //   auth: {
  //     user: 'admin',
  //     pass: 'BefJ628BNEjZw283ArMbow3w',
  //   },
  // host: 'mail.privateemail.com',
  // port: 465,
  // secure: true,
  // auth: {
  // user,
  // pass,
  // },
  // })
}

module.exports = {
  send: (url, to, code) => {
    // if (url == 'http://localhost:8080') {
    //   console.log('Confirmation code is', code)
    //   return Promise.resolve()
    // } else {
    const user = supportEmail(url)
    return createTransport(url)
      .messages()
      .send({
        from: user,
        to,
        subject: 'Email Confirmation',
        html: confirmationEmailTemplate(code, url),
      })
    // return createTransport(url).sendMail({
    //   from: user,
    //   to,
    //   subject: 'Email Confirmation',
    //   html: confirmationEmailTemplate(code, url),
    // })
    // }
  },
  passwordResetEmail: (url, to, userID) => {
    const user = supportEmail(url)
    const token = passwordResetToken({ userID, reset: true })
    const resetUrl = `${url}/reset?token=` + token

    if (url == 'http://localhost:8080') {
      console.log('Password reset URL code is', resetUrl)
      return Promise.resolve()
    } else {
      return createTransport(url).sendMail({
        from: user,
        to,
        subject: 'Password Reset Requested',
        html: passwordResetTemplate(resetUrl),
      })
    }
  },
}
