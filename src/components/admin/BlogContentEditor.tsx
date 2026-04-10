'use client'

import { RichTextEditor } from '@/components/admin/RichTextEditor'

type FormLocale = 'es' | 'en' | 'ru'

interface BlogContentEditorProps {
  value: { es: string; en: string; ru: string }
  onChange: (locale: FormLocale, html: string) => void
  activeLocale: FormLocale
}

const PLACEHOLDERS: Record<FormLocale, string> = {
  es: 'Escribe el contenido del artículo...',
  en: 'Write the article content...',
  ru: 'Напишите содержание статьи...',
}

const LOCALES: FormLocale[] = ['es', 'en', 'ru']

/**
 * Mounts three RichTextEditor instances (one per locale) and toggles
 * visibility via the `data-active` attribute so each editor preserves
 * its own history and selection across locale switches.
 */
export function BlogContentEditor({ value, onChange, activeLocale }: BlogContentEditorProps) {
  return (
    <div className="vip-blog-content-editor">
      {LOCALES.map((locale) => (
        <div
          key={locale}
          className="vip-blog-content-editor__pane"
          data-active={activeLocale === locale ? 'true' : 'false'}
        >
          <RichTextEditor
            value={value[locale]}
            onChange={(html) => onChange(locale, html)}
            placeholder={PLACEHOLDERS[locale]}
            active={activeLocale === locale}
          />
        </div>
      ))}
    </div>
  )
}
