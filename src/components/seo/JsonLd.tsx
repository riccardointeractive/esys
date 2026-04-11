/**
 * Renders one or more JSON-LD blocks as a `<script type="application/ld+json">`.
 *
 * Usage:
 *
 *   <JsonLd data={articleJsonLd(post, locale)} />
 *   <JsonLd data={[breadcrumbListJsonLd(...), residenceJsonLd(...)]} />
 *
 * Pass builders from `@/lib/seo/jsonld`. The component escapes `</` inside the
 * serialized JSON so a malicious string cannot close the script tag early.
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

function serialize(data: JsonLdProps['data']): string {
  // Guard against `</script>` injection via string content.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  )
}
