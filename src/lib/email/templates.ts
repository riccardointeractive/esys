import { siteConfig } from '@/config/site'

const BRAND = siteConfig.name
const SITE_URL = siteConfig.url

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              <strong style="font-size:20px;color:#09090b;">${BRAND}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <span style="font-size:12px;color:#a1a1aa;">${BRAND} &mdash; ${SITE_URL}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function resetPasswordEmail(resetToken: string, locale: string = 'es'): { subject: string; html: string } {
  const subjects: Record<string, string> = {
    es: 'Restablecer tu contraseña',
    en: 'Reset your password',
    ru: 'Сброс пароля',
  }

  const bodies: Record<string, string> = {
    es: `
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Has solicitado restablecer tu contraseña. Usa el siguiente código para continuar:
      </p>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px;text-align:center;margin:0 0 16px;">
        <code style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#09090b;">${resetToken}</code>
      </div>
      <p style="font-size:13px;color:#71717a;line-height:1.5;margin:0 0 8px;">
        Este código expira en 1 hora. Si no solicitaste este cambio, ignora este email.
      </p>`,
    en: `
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        You requested to reset your password. Use the code below to proceed:
      </p>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px;text-align:center;margin:0 0 16px;">
        <code style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#09090b;">${resetToken}</code>
      </div>
      <p style="font-size:13px;color:#71717a;line-height:1.5;margin:0 0 8px;">
        This code expires in 1 hour. If you didn't request this, ignore this email.
      </p>`,
    ru: `
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Вы запросили сброс пароля. Используйте код ниже:
      </p>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px;text-align:center;margin:0 0 16px;">
        <code style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#09090b;">${resetToken}</code>
      </div>
      <p style="font-size:13px;color:#71717a;line-height:1.5;margin:0 0 8px;">
        Код действителен 1 час. Если вы не запрашивали сброс, проигнорируйте это письмо.
      </p>`,
  }

  return {
    subject: subjects[locale] || subjects.es,
    html: layout(bodies[locale] || bodies.es),
  }
}

interface ContactNotificationData {
  name: string
  email: string
  phone?: string | null
  message: string
  locale?: string | null
  ip?: string | null
  userAgent?: string | null
}

/**
 * Internal notification sent to the ESYS team when someone submits the
 * public contact form. Locale-agnostic (always written in the team's
 * working language: ES).
 */
export function contactNotificationEmail(data: ContactNotificationData): {
  subject: string
  html: string
} {
  const escape = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const row = (label: string, value: string | null | undefined) =>
    value
      ? `
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#71717a;width:120px;vertical-align:top;">${label}</td>
        <td style="padding:8px 0;font-size:14px;color:#09090b;vertical-align:top;">${escape(value)}</td>
      </tr>`
      : ''

  const body = `
    <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
      Nuevo mensaje recibido a través del formulario de contacto.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      ${row('Nombre', data.name)}
      ${row('Email', data.email)}
      ${row('Teléfono', data.phone)}
      ${row('Idioma', data.locale)}
    </table>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:0 0 16px;">
      <p style="font-size:13px;color:#71717a;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Mensaje</p>
      <p style="font-size:14px;color:#09090b;line-height:1.6;margin:0;white-space:pre-wrap;">${escape(data.message)}</p>
    </div>
    <p style="text-align:center;margin:24px 0;">
      <a href="mailto:${escape(data.email)}" style="display:inline-block;padding:12px 32px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">
        Responder
      </a>
    </p>
    ${
      data.ip || data.userAgent
        ? `<p style="font-size:11px;color:#a1a1aa;line-height:1.5;margin:16px 0 0;border-top:1px solid #e4e4e7;padding-top:12px;">
          ${data.ip ? `IP: ${escape(data.ip)}<br>` : ''}
          ${data.userAgent ? `UA: ${escape(data.userAgent)}` : ''}
        </p>`
        : ''
    }`

  return {
    subject: `Nuevo mensaje de contacto — ${data.name}`,
    html: layout(body),
  }
}

export function welcomeEmail(fullName: string, locale: string = 'es'): { subject: string; html: string } {
  const subjects: Record<string, string> = {
    es: `Bienvenido a ${BRAND}`,
    en: `Welcome to ${BRAND}`,
    ru: `Добро пожаловать в ${BRAND}`,
  }

  const bodies: Record<string, string> = {
    es: `
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Hola <strong>${fullName}</strong>, bienvenido a ${BRAND}.
      </p>
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Tu cuenta ha sido creada con éxito. Ya puedes guardar propiedades en favoritos, configurar alertas de precios y mucho más.
      </p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${SITE_URL}" style="display:inline-block;padding:12px 32px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">
          Explorar propiedades
        </a>
      </p>`,
    en: `
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Hi <strong>${fullName}</strong>, welcome to ${BRAND}.
      </p>
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Your account has been created successfully. You can now save properties to favorites, set up price alerts, and more.
      </p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${SITE_URL}" style="display:inline-block;padding:12px 32px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">
          Explore properties
        </a>
      </p>`,
    ru: `
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Привет, <strong>${fullName}</strong>, добро пожаловать в ${BRAND}.
      </p>
      <p style="font-size:15px;color:#27272a;line-height:1.6;margin:0 0 16px;">
        Ваш аккаунт успешно создан. Теперь вы можете сохранять объекты в избранное, настраивать уведомления о ценах и многое другое.
      </p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${SITE_URL}" style="display:inline-block;padding:12px 32px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">
          Смотреть недвижимость
        </a>
      </p>`,
  }

  return {
    subject: subjects[locale] || subjects.es,
    html: layout(bodies[locale] || bodies.es),
  }
}
