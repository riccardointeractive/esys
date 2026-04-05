'use client'

import { useRef, useState } from 'react'
import { TurnstileWidget, type TurnstileWidgetHandle } from '@digiko-npm/ds-react'
import { HONEYPOT_FIELD_NAMES } from '@digiko-npm/cms/captcha'
import { API_ROUTES } from '@/config/routes'
import type { Dictionary } from '@/config/i18n'

interface ContactFormProps {
  dict: Dictionary
  turnstileSiteKey: string
  locale: string
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

export function ContactForm({ dict, turnstileSiteKey, locale }: ContactFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  // Captured once on mount — used by the time-trap.
  const renderedAtRef = useRef<number>(Date.now())

  const isSubmitting = status.kind === 'submitting'
  const isSuccess = status.kind === 'success'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return

    setStatus({ kind: 'submitting' })

    const formEl = e.currentTarget
    const honeypotValue =
      (formEl.elements.namedItem(HONEYPOT_FIELD_NAMES.honeypot) as HTMLInputElement | null)
        ?.value ?? ''

    try {
      const res = await fetch(API_ROUTES.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          locale,
          turnstileToken,
          [HONEYPOT_FIELD_NAMES.honeypot]: honeypotValue,
          [HONEYPOT_FIELD_NAMES.renderedAt]: renderedAtRef.current,
        }),
      })

      if (res.ok) {
        setStatus({ kind: 'success' })
        setName('')
        setEmail('')
        setPhone('')
        setMessage('')
        setTurnstileToken(null)
        turnstileRef.current?.reset()
        return
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setStatus({
        kind: 'error',
        message: data.error ?? dict.auth.errorGeneric,
      })
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } catch {
      setStatus({ kind: 'error', message: dict.auth.errorGeneric })
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    }
  }

  const canSubmit =
    !isSubmitting &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0 &&
    turnstileToken !== null

  return (
    <form className="ds-space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="ds-form-group">
        <label className="ds-label" htmlFor="contact-name">
          {dict.auth.name}
        </label>
        <input
          id="contact-name"
          type="text"
          className="ds-input ds-w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div className="ds-form-group">
        <label className="ds-label" htmlFor="contact-email">
          {dict.auth.email}
        </label>
        <input
          id="contact-email"
          type="email"
          className="ds-input ds-w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="ds-form-group">
        <label className="ds-label" htmlFor="contact-phone">
          {dict.contactPage.phone}
        </label>
        <input
          id="contact-phone"
          type="tel"
          className="ds-input ds-w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>

      <div className="ds-form-group">
        <label className="ds-label" htmlFor="contact-message">
          {dict.contactPage.message}
        </label>
        <textarea
          id="contact-message"
          className="ds-textarea ds-w-full"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      {/* Honeypot — off-screen via ds-sr-only, NOT display:none (bots skip those). */}
      <div className="ds-sr-only" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD_NAMES.honeypot}>Website</label>
        <input
          id={HONEYPOT_FIELD_NAMES.honeypot}
          name={HONEYPOT_FIELD_NAMES.honeypot}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <TurnstileWidget
        ref={turnstileRef}
        siteKey={turnstileSiteKey}
        appearance="interaction-only"
        language={locale}
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
        onError={() => setTurnstileToken(null)}
      />

      {status.kind === 'error' && (
        <p className="ds-help ds-help--error" role="alert">
          {status.message}
        </p>
      )}

      {isSuccess && (
        <p className="ds-help" role="status">
          {dict.contactPage.successMessage}
        </p>
      )}

      <button
        type="submit"
        className="ds-btn ds-btn--full"
        disabled={!canSubmit}
      >
        {isSubmitting ? dict.contactPage.sending : dict.contactPage.send}
      </button>
    </form>
  )
}
