const { passwordResetToken } = require('./token')
const { confirmationEmailTemplate, passwordResetTemplate } = require('./config')
const { parseDomain } = require('../domains')

const nodemailer = require('nodemailer')

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
  send: (url, to, code) => {
    const user = 'admin@' + parseDomain(url)
    console.log(user)
    const { SUPPORT_PASS: pass } = process.env

    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    })

    return transporter.sendMail({
      from: user,
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
