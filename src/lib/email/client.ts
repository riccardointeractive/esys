import { Resend } from 'resend'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@esysvip.com'
const FROM_NAME = 'ESYS VIP'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resend = getResend()
  if (!resend) {
    console.log(`[EMAIL] No RESEND_API_KEY — would send to ${to}: ${subject}`)
    return { success: true, mock: true }
  }

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('[EMAIL] Send failed:', error)
    return { success: false, error }
  }

  return { success: true }
}
