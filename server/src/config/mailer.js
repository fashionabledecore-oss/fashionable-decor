import nodemailer from 'nodemailer'

let transporter

// (Gmail SMTP fixed hai. SMTP_USER/SMTP_PASS/LEAD_NOTIFY_EMAIL khaali hon toh email skip, lead phir bhi save hoti hai.)
export function isMailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.LEAD_NOTIFY_EMAIL)
}

export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // (SMTP atak jaye toh form hamesha ke liye latka na rahe.)
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    })
  }
  return transporter
}
