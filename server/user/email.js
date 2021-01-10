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

const getHost = () => {
  return process.env.SUPPORT_EMAIL.split('@')[1]
}

const getProjectName = () => {
  const dict = {
    'mybitfx.com': 'MyBitFX',
    'excryptobit.com': 'ExCryptoBit',
  }

  return dict[getHost()]
}

module.exports = {
  getHost,
  getProjectName,
  send: (to, code) => {
    return transporter.sendMail({
      from: process.env.SUPPORT_EMAIL,
      to,
      subject: 'Email Confirmation',
      html: confirmationEmailTemplate(code),
    })
  },
  passwordResetEmail: (to, userID) => {
    const token = passwordResetToken({ userID })
    const url = `https://${getHost()}/reset?token=` + token

    return transporter.sendMail({
      from: process.env.SUPPORT_EMAIL,
      to,
      subject: 'Password Reset Requested',
      html: passwordResetTemplate(url),
    })
  },
}
