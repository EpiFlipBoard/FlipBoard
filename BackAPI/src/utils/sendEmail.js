import nodemailer from 'nodemailer'

let transporter = null

async function createTransporter() {
  if (transporter) return transporter

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    console.log('📧 No SMTP config found, using Ethereal (fake email)...')
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, html }) {
  try {
    const transport = await createTransporter()
    const info = await transport.sendMail({
      from: '"FlipBoard" <no-reply@flipboard.com>',
      to,
      subject,
      html,
    })

    console.log(`✅ Email sent: ${info.messageId}`)
    
    // Preview only available when using Ethereal account
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    }
    return info
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return null
  }
}
