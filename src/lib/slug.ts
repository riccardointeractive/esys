/**
 * Generate a URL-safe slug from a title string.
 * Handles Spanish accented characters + English.
 */
export function generateSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
}

/* ─── Cyrillic → Latin transliteration (BGN/PCGN-inspired, URL-friendly) ───
   Used to build slugs from Russian titles so non-resident URLs look like
   `otkrytie-bankovskogo-scheta` instead of stripping every Cyrillic character.
*/

const RU_MAP: Record<string, string> = {
  а: 'a',  б: 'b',  в: 'v',  г: 'g',  д: 'd',  е: 'e',  ё: 'yo',
  ж: 'zh', з: 'z',  и: 'i',  й: 'y',  к: 'k',  л: 'l',  м: 'm',
  н: 'n',  о: 'o',  п: 'p',  р: 'r',  с: 's',  т: 't',  у: 'u',
  ф: 'f',  х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '',   ы: 'y',  ь: '',   э: 'e',  ю: 'yu', я: 'ya',
}

function transliterateCyrillic(input: string): string {
  let out = ''
  for (const ch of input) {
    const lower = ch.toLowerCase()
    if (lower in RU_MAP) out += RU_MAP[lower]
    else out += ch
  }
  return out
}

/**
 * Slug generator for Russian titles — transliterates Cyrillic first,
 * then applies the standard slug normalisation.
 */
export function generateSlugRu(title: string): string {
  return generateSlug(transliterateCyrillic(title))
}
