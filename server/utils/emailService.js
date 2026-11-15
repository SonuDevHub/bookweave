import nodemailer from 'nodemailer'
import { renderEmailTemplate } from './emailTemplate.js'

export function isEmailConfigured() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM)
}

function createTransporter() {
  if (!isEmailConfigured()) return null

  const port = Number(process.env.SMTP_PORT)

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendPasswordResetOtpEmail(toEmail, otp) {
  const transporter = createTransporter()
  if (!transporter) {
    throw new Error('Email service is not configured')
  }

  const html = await renderEmailTemplate('adminResetOtp', {
    otp,
    expiresMinutes: 10,
    year: new Date().getFullYear(),
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'BookWeave Password Reset OTP',
    text: `Your BookWeave admin password reset OTP is ${otp}.\n\nIt expires in 10 minutes. Do not share this code with anyone.`,
    html,
  })
}

export async function sendEnquiryEmails(enquiry) {
  const transporter = createTransporter()
  if (!transporter) {
    console.warn('SMTP is not configured. Skipping enquiry notification emails.')
    return []
  }

  const {
    authorName,
    email,
    phone,
    bookTitle,
    genre,
    manuscriptStatus,
    services,
    message,
  } = enquiry

  const adminEmail = process.env.ENQUIRY_ADMIN_EMAIL || process.env.SMTP_USER
  const selectedServices =
    services && services.length ? services.join(', ') : 'Not specified'
  const year = new Date().getFullYear()

  const [adminHtml, customerHtml] = await Promise.all([
    renderEmailTemplate('enquiryAdminNotification', {
      authorName,
      email,
      phone: phone || 'Not provided',
      bookTitle: bookTitle || 'Not provided',
      genre: genre || 'Not provided',
      manuscriptStatus: manuscriptStatus || 'Not provided',
      services: selectedServices,
      message,
      year,
    }),
    renderEmailTemplate('enquiryConfirmation', {
      authorName,
      bookContext: bookTitle ? ` for "${bookTitle}"` : '',
      year,
    }),
  ])

  const adminMail = {
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `New Publishing Enquiry – ${authorName}`,
    text: [
      'New enquiry received on BookWeave.',
      '',
      `Author: ${authorName}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `Book: ${bookTitle || 'Not provided'}`,
      `Genre: ${genre || 'Not provided'}`,
      `Manuscript: ${manuscriptStatus || 'Not provided'}`,
      `Services: ${selectedServices}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: adminHtml,
  }

  const customerMail = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your Enquiry Has Been Received | BookWeave',
    text: `Dear ${authorName},\n\nThank you for choosing BookWeave. We have received your publishing enquiry and will get in touch with you soon.\n\nWarm regards,\nTeam BookWeave`,
    html: customerHtml,
  }

  return Promise.allSettled([
    transporter.sendMail(adminMail),
    transporter.sendMail(customerMail),
  ])
}
