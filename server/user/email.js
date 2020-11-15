const nodemailer = require("nodemailer");
const { confirmationEmailTemplate } = require("./config");

let transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
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
      subject: "Email Confirmation",
      html: confirmationEmailTemplate(code),
    })
  },
};