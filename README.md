# Star Martial Arts website (mystarma.com)

The Star Martial Arts site, built with **Astro + Tailwind CSS + TypeScript**. It produces a fast static site for **Cloudflare Pages**. Every page has its own web address, so Google can index and rank each program and location separately.

## Pages

| Address | Page |
|---|---|
| `/` | Home |
| `/about-us/` | About Us |
| `/locations/` | Locations |
| `/locations/west-gainesville/` | West Gainesville |
| `/locations/north-gainesville/` | North Gainesville |
| `/kids-martial-arts/` | Kids Martial Arts (ages 6–12) |
| `/teen-adult-martial-arts/` | Teen & Adult Martial Arts (13+) |
| `/after-school-program/` | Gainesville’s Best After School Program |
| `/summer-camp/` | Gainesville’s Best Summer Camp |
| `/contact-us/` | Contact Us |
| `/privacy-policy/` | Privacy Policy & SMS Terms |

A sitemap (`/sitemap-index.xml`), `robots.txt` and a 404 page are generated or included automatically.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install        # first time only
npm run dev        # opens a live preview at http://localhost:4321
npm run build      # makes the finished site in the dist/ folder
npm run preview    # previews the finished build
```

## Where to change things

| To change… | Edit |
|---|---|
| Phone numbers, addresses, location emails | `src/config/site.ts` → `LOCATIONS` |
| MyStudio registration links | `src/config/site.ts` → `ENROLL` |
| Summer Camp registration buttons | `src/config/site.ts` → `CAMP_REGISTRATION` (currently empty, so the page shows call/email) |
| Camp sale banner | `src/config/site.ts` → `CAMP_PROMO` (set `active: true` only when an offer is live) |
| After School pickup schools | `src/config/site.ts` → `SCHOOLS` (updates the After School page, the school lookup, and both location pages) |
| Where forms are sent | `src/config/site.ts` → `FORM_ENDPOINT` (your Google Apps Script) |
| Google Analytics | `src/config/site.ts` → `GA4_ID` |
| Page wording | the matching file in `src/pages/` |
| Page title / Google description | `title` and `description` at the top of each page file |
| Text-message consent wording | `src/components/SmsConsent.astro` (legal-cleared; change only with sign-off) |
| "Get more info" form | `src/components/LeadForm.astro` |
| Header / footer | `src/components/Header.astro`, `src/components/Footer.astro` |
| Business details for Google (hours, map position) | `src/config/schema.ts` |
| Colors, spacing, fonts | `src/styles/global.css` |
| Photos | `public/images/` (keep the same file name to swap a photo in place) |

## Forms

All forms send to the Google Apps Script in `FORM_ENDPOINT`. That script routes each submission to `westgv@` or `northgv@` based on the location the family picks ("Not sure yet" goes to West). Phone is required and email is optional. Text-message consent is recorded with the exact wording and a timestamp. If a send ever fails, the family sees the location's email and phone with their details pre-filled.

## Deploy to Cloudflare

The repo is connected to Cloudflare (Workers & Pages), which builds and deploys automatically on every push to `main`.

Cloudflare build settings:
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- `wrangler.jsonc` tells Cloudflare to serve the built site from `dist/`.

To deploy by hand instead: `npm run build && npx wrangler deploy`.

`public/_headers` adds security and caching headers. `public/_redirects` holds the redirects.

## Before launch

- [ ] Run `npm install` and `npm run build` once and confirm it finishes without errors (see note below).
- [x] **Redirects:** old mystarma.com pages are mapped in `public/_redirects`. Add any old blog post addresses there if you want them sent to a specific page.
- [ ] Add the GA4 measurement ID, and connect Google Search Console. Submit `https://www.mystarma.com/sitemap-index.xml`.
- [ ] Optional: add opening hours and map coordinates for each location in `src/config/schema.ts`.
- [x] All photos placed.

> **Build note:** this project was converted from the approved prototype in an environment that couldn't download packages, so `astro build` hasn't been run yet. Every page was rendered from these same files and tested in a browser: links, images, forms, Get Started, the school lookup and the camp tabs all work. The first `npm run build` is the remaining check.
