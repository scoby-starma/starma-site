# Star Martial Arts website: editing guide for Claude

This is the public website for Star Martial Arts (StarMA), a family-focused martial arts school in Gainesville, FL, founded in 2006. It's built with Astro, Tailwind CSS (utilities only, no preflight) and TypeScript, and deploys to Cloudflare from `main`. Edits are requested by the owner (Justin Scoby) in chat. Make each change exactly as requested.

## Where things live

| What | File |
|---|---|
| Phones, addresses, emails, MyStudio links, pickup schools, camp registration/promo, form endpoint | `src/config/site.ts` (single source of truth; never hard-code these in pages) |
| Page copy | `src/pages/*.astro` and `src/pages/locations/*.astro` |
| Page title / Google description | the `title` and `description` constants at the top of each page |
| FAQs | `<details>` blocks in the page **and** the matching FAQPage JSON in that page's `schema` constant; keep both in sync |
| Text-message consent | `src/components/SmsConsent.astro` |
| "Get more info" form | `src/components/LeadForm.astro` |
| Header / footer | `src/components/Header.astro`, `src/components/Footer.astro` |
| Business details for Google | `src/config/schema.ts` |
| Styles | `src/styles/global.css` |
| Photos | `public/images/` |
| Old-site redirects | `public/_redirects` |

## Hard rules

- **Never invent facts.** No reviews, testimonials, awards, rankings, statistics, credentials, belt ranks, prices, or dates that aren't in the request or already on the site. If a request needs a fact you don't have, ask first.
- **Don't change the SMS consent wording or the Privacy Policy & SMS Terms page** (it's legal-cleared and tied to A2P 10DLC approval). If asked to, confirm it has legal sign-off first.
- **Don't change** `FORM_ENDPOINT` or `wrangler.jsonc` unless the request is explicitly about them.
- **Navigation stays exactly five items:** Home, About Us, Locations, Programs (dropdown), Contact Us, plus the Get Started button.
- **Brand:** black `#000000`, red `#E10600`, white `#FFFFFF`. Never recreate or modify the logo.
- **Wording to keep:** "Gainesville’s Best After School Program" and "Gainesville’s Best Summer Camp" are department brand names, not ranking claims. Use "Mat Chat" (that spelling). Present "Early is on Time" as preparation and respect; never use "late is unforgivable".
- **Class times are not shown on the site** (families see them after Get Started).
- Summer Camp pages show **no exact prices**; offers are switched on only through `CAMP_PROMO`.
- Phone is required and email optional on every form.
- Make the smallest change that does what was asked. Match the surrounding tone: warm, confident, plain language, no hype.

## Photos

Convert new photos to WebP, max 1600 px on the long side, under about 300 KB, with a short lowercase name in `public/images/`. Place them as `<img class="bgi" src="/images/<name>.webp" alt="<describe the photo>" width="…" height="…" loading="lazy" decoding="async">` inside a `has-bgi` container, matching nearby photos. Use real, specific alt text.

## Before publishing

- `npm run build` must succeed.
- Check the changed page on a phone-sized screen as well as desktop.
