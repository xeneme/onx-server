const { passwordResetToken } = require('./token')
const { confirmationEmailTemplate, passwordResetTemplate } = require('./config')

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SUPPORT_EMAIL,
    pass: process.env.SUPPORT_PASS,
  },
})

module.exports = {
  send: (to, code) => {
    return transporter.sendMail({
      from: 'support@mybitfx.com',
      to,
      subject: 'Email Confirmation',
      html: confirmationEmailTemplate(code),
    })
  },
  passwordResetEmail: (to, userID) => {
    const token = passwordResetToken({ userID })
    const url = 'http://onyxian.herokuapp.com/reset?token=' + token

    return transporter.sendMail({
      from: 'support@mybitfx.com',
      to,
      subject: 'Password Reset Requested',
      html: passwordResetTemplate(url),
    })
  },
}
