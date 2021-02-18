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

const supportEmail = url => 'support@' + parseDomain(url)

const createTransport = url => {
  const user = supportEmail(url)
  const { SUPPORT_PASS: pass } = process.env

  return nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  })
}

module.exports = {
  getHost,
  getProjectName,
  send: (url, to, code) => {
    const user = supportEmail(url)
    return createTransport(url).sendMail({
      from: user,
      to,
      subject: 'Email Confirmation',
      html: confirmationEmailTemplate(code),
    })
  },
  passwordResetEmail: (url, to, userID) => {
    const user = supportEmail(url)
    const token = passwordResetToken({ userID })
    const resetUrl = `${url}/reset?token=` + token

    return createTransport(url).sendMail({
      from: user,
      to,
      subject: 'Password Reset Requested',
      html: passwordResetTemplate(resetUrl),
    })
  },
}
