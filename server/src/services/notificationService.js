import { getTransporter, isMailConfigured } from '../config/mailer.js'
import { INTEREST_LABELS } from '../models/Lead.js'

// (Header mein new line nahi hone chahiye.)
const oneLine = (text) => String(text ?? '').replace(/[\r\n]+/g, ' ').trim()

export async function sendLeadNotification(lead, productName) {
  if (!isMailConfigured()) {
    console.warn('Email is not configured. The lead was saved but no notification was sent.')
    return
  }

  const lines = [
    'You have a new enquiry on the Fashionable Decor website.',
    '',
    `Name:     ${oneLine(lead.name)}`,
    `Phone:    ${lead.phone}`,
    `Email:    ${lead.email || '-'}`,
    `Wants:    ${INTEREST_LABELS[lead.interest] || '-'}`,
    `Source:   ${lead.source === 'ads-landing' ? 'Ads landing page' : 'Website'}`,
    `Product:  ${productName ? oneLine(productName) : '-'}`,
    `Page:     ${lead.sourcePath || '-'}`,
    `Campaign: ${lead.utm?.campaign || '-'} (${lead.utm?.source || '-'} / ${lead.utm?.medium || '-'})`,
    '',
    'Message:',
    lead.message || '(no message, please call back)',
  ]

  await getTransporter().sendMail({
    from: `Fashionable Decor Website <${process.env.SMTP_USER}>`,
    to: process.env.LEAD_NOTIFY_EMAIL,
    replyTo: lead.email || undefined,
    subject: `New enquiry from ${oneLine(lead.name)} (${lead.phone})`,
    text: lines.join('\n'),
  })
}