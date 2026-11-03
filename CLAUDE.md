# Star Martial Arts website: editing guide for Claude

This is the public website for Star Martial Arts (StarMA), a family-focused martial arts school in Gainesville, FL, founded in 2006. It's built with Astro, Tailwind CSS (utilities only, no preflight) and TypeScript, and deploys to Cloudflare from `main`. Team members file edit requests from `/admin/`. Your job is to make each change exactly as requested, open a pull request, and let the owner (Justin Scoby) approve it.

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

- **Never invent facts.** No reviews, testimonials, awards, rankings, statistics, credentials, belt ranks, prices, or dates that aren't in the request or already on the site. If a request needs a fact you don't have, ask on the issue and stop.
- **Don't change the SMS consent wording or the Privacy Policy & SMS Terms page** (it's legal-cleared and tied to A2P 10DLC approval). If asked to, comment on the issue that it needs Justin's sign-off and stop.
- **Don't change** `FORM_ENDPOINT`, `wrangler.jsonc`, `worker/`, `.github/`, or this file unless the request is explicitly about them and comes from Justin (scoby@mystarma.com).
- **Navigation stays exactly five items:** Home, About Us, Locations, Programs (dropdown), Contact Us, plus the Get Started button.
- **Brand:** black `#000000`, red `#E10600`, white `#FFFFFF`. Never recreate or modify the logo.
- **Wording to keep:** "Gainesville’s Best After School Program" and "Gainesville’s Best Summer Camp" are department brand names, not ranking claims. Use "Mat Chat" (that spelling). Present "Early is on Time" as preparation and respect; never use "late is unforgivable".
- **Class times are not shown on the site** (families see them after Get Started).
- Summer Camp pages show **no exact prices**; offers are switched on only through `CAMP_PROMO`.
- Phone is required and email optional on every form.
- Make the smallest change that does what was asked. Match the surrounding tone: warm, confident, plain language, no hype.

## Photos

Photos attached to a request are on the `edit-uploads` branch under `requests/`. To use one:
1. `git checkout origin/edit-uploads -- requests/<file>`
2. Convert to WebP, max 1600 px on the long side, under about 300 KB. For example:
   `npx --yes sharp-cli -i requests/<file> -o public/images/<name>.webp resize 1600 1600 --fit inside -f webp -q 80`
   (or Python Pillow if available). Use a short descriptive lowercase name.
3. Use it as `<img class="bgi" src="/images/<name>.webp" alt="<describe the photo>" width="…" height="…" loading="lazy" decoding="async">` inside a `has-bgi` container, matching how nearby photos are placed.
4. Delete `requests/` from the working tree before committing; only the optimized file goes in.
Use real, specific alt text. Don't add photos of identifiable children unless the request says permission is confirmed.

## Before opening the PR

- `npm run build` must succeed.
- Write the PR description for a non-technical owner: what changed, on which page, and anything they should double-check on the preview.
- One request = one branch (`edit/issue-<number>`) = one PR, with "Closes #<number>" in the body.
