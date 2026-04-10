const WORDS_PER_MINUTE = 200

/**
 * Estimate reading time in minutes from sanitized HTML.
 * Strips tags, counts words, divides by 200 wpm, ceil, min 1.
 */
export function calcReadingMinutes(html: string): number {
  if (!html) return 1
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 1
  const words = text.split(' ').length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
