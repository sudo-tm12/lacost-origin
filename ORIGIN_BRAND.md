# BRAND — Origin

**Instagram:** [@origin_safrica](https://www.instagram.com/origin_safrica/)
**Deliverable:** E-commerce storefront
**Agency:** TshedzaWebDev, Pretoria

---

## 1. Brand at a glance

Origin is a mid-tier South African contemporary fashion brand. Mens and womenswear.
Natural fibres, clean silhouettes, honest construction. The name says it: Origin is
about where things start — the material, the idea, the place.

The brand positions itself between streetwear accessibility and luxury
inaccessibility. Think Aimé Leon Dore's editorial confidence, adapted for South
African light and South African people. It's fashion that feels considered
without feeling precious. Expensive without feeling exclusionary.

**Tagline (internal):** Made in SA. Made to last.

---

## 2. The client — Origin

### What they sell

Full-range contemporary fashion for men and women:

- **Womens:** Dresses, skirts, structured jackets, knitwear, camisoles, trousers
- **Mens:** Overshirts, linen shirts, heavy cotton tees, wide-leg trousers, utility cargos, polos
- **Price range:** R599–R1,399 (mid-tier)
- **Materials:** Linen, cotton, wool blends, denim — natural fibres throughout

### What they stand for

| Value | What it means |
|---|---|
| **Origin** | Everything starts somewhere. The brand celebrates South African roots — the materials, the light, the people who make the clothes |
| **Honesty** | No fake scarcity. No "only 2 left." No discount games. Sold-out sizes are visible and struck through. The truth about availability |
| **Quality** | French seams. Natural fibres. Pre-washed fabrics. Clothes that last beyond the season |
| **Restraint** | The brand doesn't shout. It doesn't need to. The design, the materials, and the photography speak |
| **Inclusivity** | Full size range (XS–XL). Mens and womens. Not gendered-siloed — the store treats both equally |

### Brand personality

Six adjectives: **Confident. Warm. Restrained. Contemporary. Honest. Grounded.**

Origin is not:
- A fast-fashion brand (no urgency timers, no trend-chasing)
- A luxury brand (no exclusionary pricing, no pretension)
- A streetwear brand (no drops, no hype, no artificial scarcity)

Origin IS: the clothes you reach for every day. The shirt that fits. The trousers
that move. Made properly. Priced fairly. Designed in South Africa.

---

## 3. The audience — customer persona

### Primary persona: The Considered Shopper

| Attribute | Detail |
|---|---|
| **Demographic** | 22–38, urban SA (Joburg, Cape Town, Durban, Pretoria), employed, fashion-aware but not fashion-obsessed |
| **Income** | R15,000–R40,000 monthly household |
| **Shopping behaviour** | Researches before buying. Will check Instagram, then the website, then maybe visit in person. Values quality over quantity. Buys fewer pieces, buys better pieces |
| **Device** | 77% mobile. Browses on phone during commute / lunch / evening. May complete purchase on desktop but discovery is always mobile |
| **Values** | Authenticity. Quality. Supporting local. Doesn't want to look like everyone else but doesn't want to look like they're trying too hard |
| **Pain points** | Can't find quality SA-made clothing easily online. Tired of international shipping and returns. Wants to support local but local often means "amateur" — Origin changes that |
| **References** | Follows @origin_safrica. Also follows: local designers, interior design accounts, architectural photography, travel |

### Secondary persona: The Gift Buyer

| Attribute | Detail |
|---|---|
| **Demographic** | 28–50, buying for partner / friend / family member |
| **Behaviour** | Knows the recipient's size and style. Looking for something well-made at a fair price. Wants the gift to feel considered |
| **Needs** | Clear sizing. Easy returns. Gift-friendly packaging wouldn't hurt |

---

## 4. Instagram aesthetic — the visual north star

Based on direct screenshots of @origin_safrica's feed:

### Color palette (extracted from feed)

Warm earth tones dominate. Golden-hour photography. Natural settings.

| Tone | Hex | Where it appears |
|---|---|---|
| Warm cream | `#FDFBF8` | Backgrounds, negative space |
| Sand / clay | `#F2ECE2` | Secondary surfaces, product backdrops |
| Deep charcoal | `#1C1914` | Text, dark garments, shadows |
| Warm taupe | `#9B8B7A` | Secondary text, earth tones in clothing |
| Warm stone | `#E8DFD3` | Borders, subtle dividers |
| Accent blue | `#2440FF` | UI elements only — never on garments |

### Photography style

- **Light:** Golden hour. Warm. Never cool or blue-cast. South African light — hard and golden
- **Settings:** Natural — stoops, fields, urban textures, raw plaster, brick
- **Models:** South African. Diverse. Shown naturally — not posed stiffly, not runway
- **Composition:** Clean. Uncluttered. The garment is always the focus
- **Consistency:** Every product shot has the same lighting, angle, and crop. Consistency IS the premium signal

### Typography on Instagram

- Logo: "ORIGIN" in a clean, structured sans-serif — bold, confident, uppercase
- Captions: Minimal. Sentence case. No emoji spam. No hashtag clutter

### Content mix

- Product photography (primary)
- Behind-the-scenes (making, materials, studio)
- Editorial / lifestyle (models in context)
- Collaborations (tagged: @keneilwe.m and others)

---

## 5. Design system

### Colors — the Origin palette

```
paper   #FDFBF8    Warm off-white — primary surface
chalk   #F2ECE2    Warm cream — secondary surface, inputs, skeletons
ink     #1C1914    Warm near-black — all text, dark elements
ash     #9B8B7A    Warm taupe — secondary text, captions, meta
line    #E8DFD3    Warm stone — borders, dividers, 1px only
signal  #2440FF    Blue — interactive states, focus rings, sale prices
```

**The signal rule:** Signal blue appears in exactly six places:
1. Focus rings
2. Cart count badge
3. Sale price (reduced figure only)
4. Active filter / active nav state
5. Free-delivery progress indicator (cart)
6. Form validation errors

Never a section background. Never a gradient. Never decorative. The moment it
decorates, the design stops reading as premium.

### Semantic color states

| State | Treatment |
|---|---|
| In stock | No treatment — silence is the default |
| Low stock | `ink`, small caps: "Only 2 left" — only when true |
| Out of stock | `ash` + strikethrough. Visible, never hidden |
| Sale | `ash` strikethrough original, `signal` reduced price |
| Error | `signal` + icon + text |

### Typography

**Display — Instrument Serif**
High-contrast editorial serif. Hero headlines, section openers, editorial moments.
Never for UI. Never for product names. Never below 28px.
Tight leading (0.92–0.95), slightly negative tracking at large sizes.
```css
font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
```

**UI — Archivo**
Grotesque with a tight, slightly condensed feel. Everything else: navigation,
product names, prices, buttons, body, forms. Uppercase at 0.1–0.15em tracking
for nav, buttons, labels.
```css
font-family: 'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```
`font-variant-numeric: tabular-nums` on all prices.

### Type scale

| Token | Size | Usage |
|---|---|---|
| `hero` | `clamp(2.75rem, 7vw, 5.5rem)` | Hero headline — Instrument Serif |
| `page-title` | `clamp(1.75rem, 4vw, 2.5rem)` | Page titles — Instrument Serif |
| `section-title` | `clamp(1.5rem, 3vw, 2.25rem)` | Section headers — Instrument Serif |
| `product-name` | `14px` / `18px` (PDP) | Product names — Archivo |
| `body-lg` | `17px` | PDP description — Archivo |
| `body` | `15px` | Body text — Archivo |
| `body-sm` | `13px` | Secondary text, meta — Archivo |
| `caption` | `11px` | Labels, eyebrows, filters — Archivo uppercase |
| `button` | `12px` | Buttons, nav — Archivo uppercase |

### Spacing — 8-point grid

All spacing values on the 8-point system:
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 128`

- Section gap: 64px mobile / 96px desktop
- Card internal: 16–24px
- Grid gap: 16px mobile / 24px desktop
- Page gutter: 16px mobile / 24px tablet / 48px desktop
- Touch targets: 44px minimum on every interactive element

### Grid

| Breakpoint | Columns | Gap |
|---|---|---|
| 360–767px | 2 | 16px |
| 768–1023px | 3 | 24px |
| 1024px+ | 4 | 24px |

Product image aspect ratio: **3:4, locked.** Enforced with `aspect-ratio` for CLS protection.

### Borders & surfaces

- Border radius: **0** on cards, images, inputs. `999px` on pills and badges only
- Borders: 1px, `line`. Never 2px. Never dashed
- **No box shadows anywhere.** Elevation comes from hairlines and spacing

### Motion

| Interaction | Duration | Easing |
|---|---|---|
| Hover / focus | 200ms | ease-out |
| Gallery image change | 300ms | ease-in-out |
| Scroll reveal | 700ms | ease-out |
| Add-to-bag confirmation | 200ms | ease-out |

**Animate only `transform` and `opacity`.** Animating layout properties causes
main-thread work. `prefers-reduced-motion: reduce` collapses everything to instant.

### Icons

8 custom SVGs. No icon library. All 24×24 viewBox, stroke-based, `currentColor`.
Bag, Heart, Search, Hamburger, Close, Arrow Right, Arrow Left, Plus/Minus.

---

## 6. Brand voice

### Writing principles

- **Sentence case everywhere** except nav, buttons, labels
- **Plain verbs:** "Add to bag," not "Add to your shopping bag"
- **Match label to result:** "Add to bag" → "Added"
- **Specific, not clever:** "Arrives Thu 3 Aug" not "3–5 business days"
- **No exclamation marks.** Ever. The brand doesn't shout
- **No emoji in interface copy.** The photography provides the personality

### Examples

| Context | Origin voice | Generic (avoid) |
|---|---|---|
| Newsletter signup | "New collections, editorial stories, and early access. Twice a month at most." | "Sign up for 10% off your first order!" |
| Empty cart | "Your bag is empty." + link to new arrivals | "Oops! Nothing here yet 😢" |
| Sold-out size | Strikethrough on size button. Visible, never hidden | "Out of stock" badge hiding the size |
| Error message | "Enter a delivery address — we need it to calculate shipping." | "Invalid input." |
| Confirmation | "Order confirmed. Arrives Thu 3 Aug." | "Thank you for your purchase!" |

### What Origin never says

- "Welcome to our store" (the brand doesn't explain itself)
- "Hurry!" / "Selling fast!" / "Only X left!" (no fake urgency)
- "Premium" / "Luxury" / "Exclusive" (let the product speak)
- "You may also like" → instead: "You might also like" (suggestion, not algorithm)

---

## 7. The signature interaction

**The product card is a gallery.** This is the one bold move.

~80% of apparel sites give shoppers fewer than three images from the product
card. For clothing — where fit, drape, and fabric all need visual evidence —
people want five to fifteen. When the card shows one image, every mildly
interesting item demands a PDP visit. Most people don't bother.

Origin's card carries the full gallery:
- **Desktop:** Hover scrubs five shots. Cursor position drives the gallery.
  A segmented progress indicator and a size rail slide up.
- **Mobile:** Swipeable gallery with always-visible dot indicators.
  Size selection opens a bottom sheet — never a dropdown.
- **Keyboard:** Card is focusable. Arrow keys step the gallery.
- **Performance:** Only the primary image loads eagerly. The other four
  prefetch on intent (pointerenter / focus / touchstart).

This is the single interaction that defines the store. It says: we respect
your time enough to show you the product before asking you to click.

---

## 8. Pages & architecture

| Route | Page | What it does |
|---|---|---|
| `/` | Homepage | Hero → Womens editorial → Featured products → Mens editorial → Footer |
| `/products` | Product listing | Full grid, 4/3/2 columns, category filter pills (All / Womens / Mens) |
| `/products/[id]` | Product detail | 5-image gallery, size selector, add-to-bag (sticky on mobile), details accordion, related products |
| `/about` | About (planned) | Brand story, 3–4 paragraphs, one editorial image |
| `/size-guide` | Size guide (planned) | Measurement charts, fit notes |
| `/checkout` | Checkout (planned) | Single-page, PaymentProvider interface |

---

## 9. Competitive positioning

| Brand | Origin takes | Origin does differently |
|---|---|---|
| **Aimé Leon Dore** | Editorial cadence, typographic confidence, lifestyle-over-catalog | Mobile-first architecture, visible sizing in cards, SA context |
| **COS** | Architectural whitespace, restraint, aggressive editing | Warmer palette, richer card interaction, more personality |
| **Stüssy** | Mobile confidence, brand attitude, persistent cart | More editorial depth, size rail in card, five-image gallery scrub |
| **Cotton On (SA)** | Category-driven navigation, local relevance, multi-tier menus | More editorial, less promotional, no urgency theater, premium positioning |

---

## 10. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server rendering for SEO, `next/image` for the <100KB image budget, route-level code splitting |
| Styling | Tailwind v4 with `@theme` tokens | No arbitrary hex in components. Design tokens in one file |
| Fonts | next/font/google (Archivo + Instrument Serif) | Self-hosted WOFF2. No runtime Google requests. `font-display: swap` |
| State | React Context (cart + UI) | No Redux — the app doesn't earn it |
| Database | MongoDB via Mongoose | Within the MERN spirit of the original quote |
| Payments | PaymentProvider interface | One gateway now, config-change for Ozow/BNPL later |
| Images | Deterministic gradient placeholders | Swappable for real photos in one file (`src/lib/images.ts`) |

---

## 11. Performance budget

These are constraints, not goals:

| Metric | Budget |
|---|---|
| LCP (p75, mobile) | < 2.0s |
| INP (p75) | < 160ms |
| CLS (p75) | < 0.08 |
| JS on initial load | < 200KB gzipped |
| Any product image | < 100KB, WebP/AVIF |
| Lighthouse Performance (mobile) | 90+ |
| Lighthouse Accessibility | 90+ |

Targets sit deliberately below Google's thresholds because these are measured
on real SA devices and networks.

---

## 12. What's NOT in the brand

- No countdown timers or urgency theater
- No popups (newsletter, exit-intent, discount wheel)
- No carousels (auto-advancing or otherwise)
- No social proof widgets ("Sarah from Sandton bought this")
- No trust badges
- No box shadows
- No dropdowns for size selection — ever
- No decorative gradients (hero overlay excepted)
- No stock photography from non-SA sources
- No "SALE" badges — the price tells the story
