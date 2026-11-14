import nodemailer from 'nodemailer'

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])

export const sendEnquiryEmails = async (enquiry) => {
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

  const adminMail = {
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `New Publishing Enquiry – ${authorName}`,
    text: `
New enquiry received on BookWeave.

Author: ${authorName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Book: ${bookTitle || 'Not provided'}
Genre: ${genre || 'Not provided'}
Manuscript: ${manuscriptStatus || 'Not provided'}
Services: ${services?.join(', ') || 'Not specified'}

Message:
${message}
    `,
  }

  const customerMail = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your Enquiry Has Been Received | BookWeave',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#263329;">
        <h2 style="color:#5e7f49;">BookWeave</h2>
        <p>Dear ${escapeHtml(authorName)},</p>
        <p>Thank you for choosing BookWeave.</p>
        <p>We've received your publishing enquiry. Our team will review your details and get in touch with you soon.</p>
        <p style="margin-top:28px;">Warm regards,<br><strong>Team BookWeave</strong></p>
        <p style="color:#5e7f49;font-size:13px;">Every story deserves to be told.</p>
      </div>
    `,
  }

  return Promise.allSettled([
    transporter.sendMail(adminMail),
    transporter.sendMail(customerMail),
  ])
}
