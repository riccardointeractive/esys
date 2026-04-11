# ESYS VIP — SEO Roadmap

Strategia SEO del blog e azioni tecniche per portare `esysvip.com` a ranking organico su Costa Blanca / Alicante in tre lingue (ES canonica, EN, RU).

Ultimo aggiornamento: 2026-04-11.

## Stato di avanzamento

| Fase | Stato | Note |
|------|-------|------|
| 0 — Dati cliente contatto | ⏳ in attesa | email/telefono/indirizzo necessari per `RealEstateAgent` schema |
| 1 — Infrastruttura SEO | 🟡 quasi completa | manca solo `RealEstateAgent` (dipende da Fase 0) |
| 2 — Guía de Compra (18) | 🔲 da iniziare | |
| 3 — Zonas y Barrios (20) | 🔲 da iniziare | |
| 4 — Inversión + Expats (25) | 🔲 da iniziare | |
| 5 — Lifestyle + Obra Nueva + Segunda Mano (37) | 🔲 da iniziare | |

---

## Contesto

- **Mercato:** real estate Costa Blanca / Alicante, premium ma human.
- **Lingue:** ES (canonica) + EN + RU. Target expat UK/IE/DE/NL + comunità rusa storica.
- **Stack blog:** TipTap + `sanitize-html`, categorie multilingua, cover Unsplash via picker integrato, slug derivato da `title_es`.
- **Workflow contenuti:** ogni articolo viene scritto una volta in ES, poi tradotto inline in EN e RU nello stesso payload (vedi `CLAUDE.md` → "Blog Article Workflow").
- **Vincolo produzione:** gli articoli devono essere **image-light** — solo cover Unsplash, niente gallerie, niente screenshot, niente diagrammi. Preferire format: liste, processi, comparazioni, FAQ, glossari, profili di zona, breakdown di costi/tasse.

---

## Modifiche SEO tecniche (prioritizzate)

### Fase 0 — Bloccanti (dati cliente)

- [ ] Riempire `siteConfig.contact`: `email`, `phone`, `address`, `city`, `postalCode`. Senza questi non è possibile emettere schema `LocalBusiness` / `RealEstateAgent` né configurare Google Business Profile.

### Fase 1 — Infrastruttura SEO (una volta, non ripetibile)

1. ✅ **`src/app/sitemap.ts`** — sitemap dinamica Next 16 che include:
   - Tutte le route statiche × 3 lingue (ES/EN/RU)
   - Ogni proprietà pubblicata × 3 lingue (`lastModified = updated_at`)
   - Ogni post del blog pubblicato × 3 lingue
   - Ogni categoria blog attiva × 3 lingue
   - Field `alternates.languages` con hreflang + `x-default` su ES
   - **Slug localizzati per-lingua** via `localizedRoutes(lang)` (es. `/es/propiedades`, `/en/properties`, `/ru/nedvizhimost`)
   - `revalidate = 3600`

2. ✅ **`src/app/robots.ts`** — public aperto, bloccati `/admin`, `/cuenta`, `/api`, `/login`, `/registro`, `/favoritos`, `/buscar`, varianti `?page=*`, `?utm_*`, `?ref=*`. Sitemap + host dichiarati.

3. ✅ **Hreflang nelle metadata.** Helper `src/lib/seo/alternates.ts` con `hreflang.*` per ogni tipo di route (home, properties, propertyDetail, newBuilds, resale, about, contact, blog, blogPost, blogCategory, blogCategoryIndex). Wirato su 11 pagine pubbliche. Home e property detail avevano metadata assenti — ora emettono title/description/canonical/hreflang completi. `metadataBase` impostato nel root layout.

4. 🟡 **JSON-LD base:**
   - ⏳ `RealEstateAgent` (LocalBusiness) — in attesa di Fase 0 (dati contatto cliente)
   - ✅ `BreadcrumbList` su blog post, blog category, property detail
   - ✅ `Article` su ogni blog post (headline, description, image, datePublished, dateModified, inLanguage, wordCount, author/publisher `ESYS VIP` come Organization, mainEntityOfPage)
   - ✅ `Residence` / `Apartment` / `SingleFamilyResidence` su property detail, con `Offer` (price/currency/availability), `PostalAddress`, `GeoCoordinates`, `floorSize` MTK, `numberOfBedrooms`, `numberOfBathroomsTotal`, `yearBuilt`
   - 🔲 `FAQPage` sui post con Q&A strutturata (da aggiungere quando i primi articoli guida escono con sezione FAQ in coda)
   - Helper: `src/lib/seo/jsonld.ts` + component `src/components/seo/JsonLd.tsx` (escape `</` safe)

### Fase 2 — Alto impatto (misurabile in 4-8 settimane)

5. **OG image dinamiche.** Usare `opengraph-image.tsx` per route — `cover_image_url` per i post, foto principale per le proprietà. Template visivo ESYS VIP con logo + titolo overlay.

6. **Slug keyword-rich stabili.** Generazione slug da `title_es` con stop-word removal; blocco al primo publish, no rinomina senza 301.

7. **Internal linking strutturato.** Ogni articolo chiude con:
   - 3 link verso post correlati (related posts server-side in fondo a `[postSlug]`)
   - 1 link verso `/propiedades?zona=...` o `/obra-nueva` o `/segunda-mano`
   - 1 CTA verso `/contacto`

8. **Pillar pages collegate al catalogo.** I 20 articoli "Zonas y Barrios" devono linkare la pagina filtrata `/propiedades?zona={zona}`, e la pagina filtrata deve linkare l'articolo. Autorità topica locale.

9. **Profondità minima:** ≥1200 parole ES per articolo, H2/H3 obbligatori, FAQ in fondo, 2-3 outbound link autorevoli (notariado.org, sede.agenciatributaria.gob.es, ine.es).

### Fase 3 — Qualità e manutenzione

10. **Indicizzazione paginata.** `/blog?page=2+` → canonical a `/blog` + `noindex,follow`.
11. **Cover alt text obbligatorio.** Forzare `cover_alt` non-empty nel form admin.
12. **Core Web Vitals.** LCP < 2.5s su `/blog` e `/blog/[slug]`: `next/image priority` sulla cover, `cover_blur_hash` come placeholder.
13. **Google Search Console + Bing Webmaster.** Verifica dominio, invio sitemap, inclusione Bing (usato anche da Yandex-like aggregators per target RU).
14. **Footer SEO.** Linka da footer le 7 categorie blog + le 20 zone della Categoria 2 → distribuzione link equity.
15. **Schema multilingua property.** `RealEstateListing` con `availableLanguage: ['es','en','ru']`.
16. **Analytics no-cookie.** Plausible o Umami self-hosted invece di GA4 → niente CMP, dati puliti.

---

## Roadmap contenuti — 100 articoli in 7 categorie

> Tutti gli articoli sono image-light: una sola cover Unsplash basta.

### Categoria 1 — Guía de Compra (18)
> Intent bottom-of-funnel. Query ad alta conversione: "cómo comprar", "gastos compraventa", "NIE", "ITP". CTA diretta a `/contacto`.

1. Cómo comprar una vivienda en España siendo extranjero: guía paso a paso
2. NIE: qué es, cómo solicitarlo y por qué lo necesitas antes de firmar
3. Hipotecas para no residentes en España: bancos, condiciones, LTV
4. ITP, IVA y AJD: los tres impuestos de la compraventa explicados
5. Gastos de compraventa: notaría, registro, gestoría y tasación
6. Abrir una cuenta bancaria en España siendo no residente
7. Reserva, arras y contrato privado: las tres etapas antes del notario
8. El papel del notario en la compraventa española
9. Nota simple del Registro: cómo leerla línea a línea
10. Cargas, embargos e hipotecas heredadas: cómo verificar antes de comprar
11. Cédula de habitabilidad y licencia de primera ocupación
12. Certificado energético: qué letra debe tener tu próxima vivienda
13. Comunidad de propietarios: derechos, obligaciones y cuotas
14. IBI, basura y suministros: los costes anuales del propietario
15. Plusvalía municipal tras la última reforma: quién paga qué
16. Cómo negociar el precio de una vivienda en España
17. Comprar a particular o a promotora: diferencias clave
18. 10 errores frecuentes al comprar tu primera vivienda en la Costa Blanca

**Cover Unsplash hint:** `notary signing`, `house keys spain`, `mediterranean home contract`

### Categoria 2 — Zonas y Barrios (20)
> Local SEO puro. Ogni articolo è landing topica per "vivir en {zona}", "comprar piso en {zona}". Linka `/propiedades?zona=...`.

1. Vivir en Alicante ciudad: barrios, precios y calidad de vida
2. Playa de San Juan: el barrio costero más demandado de Alicante
3. Albufereta: tranquilidad y vistas al Mediterráneo
4. Cabo de las Huertas: exclusividad residencial junto al mar
5. Centro histórico de Alicante: vivir entre tradición y vida urbana
6. Benalúa y Pla del Bon Repós: los barrios en auge de la ciudad
7. El Campello: pueblo marinero a las puertas de Alicante
8. Mutxamel y San Vicente del Raspeig: residencial y universitario
9. Santa Pola: salinas, dunas y vivienda mediterránea
10. Guardamar del Segura: pinar, playa y precios accesibles
11. Torrevieja: la capital extranjera de la Costa Blanca
12. Orihuela Costa: golf, urbanizaciones y comunidad internacional
13. Pilar de la Horadada: el sur tranquilo de la Costa Blanca
14. Altea: arte, casco antiguo y costa norte alicantina
15. Calpe y el Peñón de Ifach: vivir frente a un símbolo
16. Benidorm residencial: más allá del rascacielos turístico
17. Jávea / Xàbia: cala, montaña y comunidad expat consolidada
18. Dénia: gastronomía Unesco y puerto al alcance de la mano
19. Moraira y Teulada: lujo discreto en la Costa Blanca norte
20. Pueblos del interior alicantino: comprar lejos del bullicio

**Cover Unsplash hint:** `alicante old town`, `costa blanca village`, `mediterranean coastal town spain`

### Categoria 3 — Estilo de Vida (15)
> Top-of-funnel, branding, internal linking verso le zone.

1. Clima de la Costa Blanca: 300 días de sol y qué significa para ti
2. Gastronomía alicantina: arroces, pescados y bodegas imprescindibles
3. Playas con bandera azul en la provincia de Alicante
4. Hogueras de San Juan: la fiesta que define a Alicante
5. La ruta del vino en Alicante: bodegas, fondillón y enoturismo
6. Mercados municipales: dónde comprar producto fresco cerca de casa
7. Senderismo en la Costa Blanca: rutas a un paso de tu vivienda
8. Golf en Alicante: los campos más reconocidos de la provincia
9. Puertos deportivos: amarrar tu barco cerca de casa
10. Vida nocturna en Alicante: zonas, ambientes y restaurantes con vistas
11. Qué hacer en Alicante con niños: ocio familiar todo el año
12. Calendario cultural anual de la provincia de Alicante
13. Cómo es realmente vivir en la Costa Blanca: la rutina cotidiana
14. Los miradores más espectaculares de la provincia
15. Vida slow en la Costa Blanca: el lujo de no tener prisa

**Cover Unsplash hint:** `alicante beach`, `paella valencia`, `mediterranean lifestyle`

### Categoria 4 — Inversión Inmobiliaria (12)
> Investment intent. Target Russian/CIS + UK + Northern Europe.

1. Rentabilidad del alquiler en la Costa Blanca: cifras reales
2. Alquiler turístico en Alicante: licencias, normativa y rentabilidad
3. Alquiler de larga estancia vs vacacional: cuál te conviene
4. Cómo calcular el ROI de una vivienda de inversión paso a paso
5. Evolución del precio de la vivienda en la Costa Blanca (último ciclo)
6. Las zonas con mayor revalorización en la provincia de Alicante
7. Diversificar cartera con inmobiliario en España
8. Fiscalidad del alquiler para no residentes en España
9. Sociedades patrimoniales: cuándo tiene sentido comprar a través de una SL
10. Reformar para revalorizar: las mejoras con mayor retorno
11. Crowdfunding inmobiliario vs compra directa
12. Los 7 indicadores que debes mirar antes de invertir en una zona

**Cover Unsplash hint:** `real estate investment`, `house keys with calculator`, `apartment building spain`

### Categoria 5 — Obra Nueva (12)
> Pillar di prodotto. CTA verso `/obra-nueva`. Long-tail: "comprar sobre plano", "memoria de calidades".

1. Por qué elegir obra nueva en la Costa Blanca
2. Comprar sobre plano: ventajas, riesgos y garantías
3. Calendario típico de una promoción de obra nueva
4. Aval bancario y cantidades a cuenta: la Ley 38/1999 explicada
5. Memorias de calidades: qué mirar y qué exigir
6. Eficiencia energética en la nueva vivienda: la certificación A explicada
7. Aerotermia, suelo radiante y bomba de calor: el confort moderno
8. Domótica en obra nueva: lo que debes pedir hoy
9. Cómo personalizar una vivienda de obra nueva sin perder garantías
10. Recepción de llaves: el checklist antes de firmar
11. Garantías post-entrega: trienal, decenal y de acabados
12. Promociones más esperadas de la Costa Blanca este año

**Cover Unsplash hint:** `new construction spain`, `modern apartment building`, `architectural blueprint`

### Categoria 6 — Segunda Mano (10)
> Pillar di prodotto. CTA verso `/segunda-mano`.

1. Ventajas reales de comprar una vivienda de segunda mano
2. Cómo detectar humedades, grietas y problemas estructurales en una visita
3. Reformar una vivienda en España: presupuesto y plazos realistas
4. Licencia de obra mayor vs menor: qué necesitas para reformar
5. Subvenciones para rehabilitación energética en la Comunidad Valenciana
6. Cómo valorar correctamente una vivienda de segunda mano
7. Tasación oficial: cuándo es obligatoria y cuándo conviene
8. ITE y antigüedad: qué saber antes de comprar un edificio antiguo
9. Las preguntas que siempre debes hacer al vendedor
10. Vivienda heredada: cómo se compra y qué riesgos asociados existen

**Cover Unsplash hint:** `mediterranean home renovation`, `old spanish apartment`, `house inspection`

### Categoria 7 — Mudarse a España / For Expats (13)
> Conquista della SERP straniera in EN/RU, evita concorrenza con i grandi portali spagnoli.

1. Mudarse a España desde Reino Unido tras el Brexit
2. Visado de Nómada Digital en España: requisitos, proceso, ventajas
3. Golden Visa: la inversión inmobiliaria que abre Europa
4. Residencia no lucrativa en España: lo que necesitas saber
5. Sistema sanitario español para residentes extranjeros
6. Colegios internacionales en la provincia de Alicante
7. Cómo convalidar tu carnet de conducir extranjero en España
8. Empadronamiento: el primer trámite al instalarte
9. Aprender español al llegar: academias y recursos en Alicante
10. Comunidad rusa en la Costa Blanca: dónde encontrarla
11. Comunidad británica en Alicante: zonas, eventos y servicios
12. Enviar dinero a España sin perder en comisiones
13. Tu primera semana en la Costa Blanca: checklist práctico

**Cover Unsplash hint:** `passport spain`, `moving boxes new home`, `expat life mediterranean`

**Totale: 18 + 20 + 15 + 12 + 12 + 10 + 13 = 100**

---

## Ordine operativo suggerito

| Fase | Quando | Cosa |
|------|--------|------|
| **0** | Appena arrivano i dati cliente | Riempire `siteConfig.contact` |
| **1** | Settimana 1 | `sitemap.ts` + `robots.ts` + hreflang + JSON-LD base (RealEstateAgent, Breadcrumbs, Article) |
| **2** | Settimane 2-3 | Scrivere i 18 articoli di **Categoria 1 — Guía de Compra** (alta intent, conversione immediata) |
| **3** | Mese 2 | Scrivere le **20 zone** di Categoria 2 in parallelo all'attivazione delle landing `/propiedades?zona=...` |
| **4** | Mesi 3-4 | **Inversión Inmobiliaria** + **Para Extranjeros** (mercati esteri) |
| **5** | Mesi 5-6 | **Lifestyle**, **Obra Nueva**, **Segunda Mano** a 3-4 articoli/settimana |

---

## Note operative

- Tutti gli articoli seguono il workflow in `CLAUDE.md` → "Blog Article Workflow": ES canonico, EN e RU inline, single-line HTML block, Unsplash hint.
- Slug deriva sempre da `title_es`, blocco al publish.
- Ogni articolo deve citare almeno 2 fonti autorevoli (notariado.org, AEAT, INE, registradores.org, idealista data reports) via outbound link.
- Il manifesto `ds.manifest.json` non va toccato da questa roadmap (è contenuto, non DS).
