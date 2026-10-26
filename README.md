# Southfield Full Arch landing page

Portable React/Vite source for the Southfield Family Dental Center full-arch campaign: `https://github.com/Alex-WM4D/southfield-full-arch-v2`.

This is a source export of the latest approved site as of October 26, 2026, including the $14,990 PMMA and $17,990 zirconia offers. This portable repository and the original managed/live project are separate; there is no automatic two-way sync. Hosting for this repository must be connected separately. The earlier GitHub repository is not modified.

If you are starting from the downloadable source ZIP, see [`docs/UPLOAD-TO-GITHUB.md`](docs/UPLOAD-TO-GITHUB.md) for upload instructions.

## What is in the page

The current campaign includes:

- **“Restore Your Confidence With Dental Implants”** as the hero headline.
- Two per-arch options: **$14,990 PMMA acrylic** and **$17,990 final zirconia**, with a **$3,000 per-arch upgrade** to final zirconia.
- Approved page copy for included care, material differences, warranty terms, financing examples, reviews, FAQs, and patient stories. Keep these as approved claims; do not add clinical inferences or promise an outcome for an individual patient.
- Dr. Oleg’s authority panel with on-scroll count-up figures including **26+ years** and **1,000+ implants placed**. Treat these as approved marketing figures and verify them before changing them.
- A weekly promotion countdown ending each **Sunday at 11:59 PM Eastern**.
- An autoplay five-case patient gallery. The current hero patient-story thumbnail is **Troy’s supplied thumbnail**; individual patient experiences and results vary.
- A decorative hero background video with separate optimized desktop and mobile MP4 files. The media is local, loads conservatively, and falls back to the poster when reduced-motion or connection settings call for it.

Images are bundled in `client/public/images/`. The decorative hero videos are bundled in `client/public/videos/` at approximately 1.56 MB for desktop and 0.75 MB for mobile. This export contains 25 frontend source files (including the shared offer-pricing helper) and 16 media assets (14 images and 2 videos); `docs/asset-manifest.json` records the exported image/video inventory. When replacing a cached image or video, use a new filename rather than reusing the old URL.

Google Fonts, Google Drive patient/team video playback, TrueLark scheduling, and the Google Maps directions link remain external dependencies and require internet access. Google Drive testimonial videos load when a visitor opens/clicks them, not as initial page media. They are not replaced by local credentials or a Manus runtime.

## Run locally

Use Node.js **22.12 or later** and npm:

```bash
git clone https://github.com/Alex-WM4D/southfield-full-arch-v2.git
cd southfield-full-arch-v2
npm ci
npm run dev
```

Open the localhost URL printed by Vite. This is a portable Vite build: no Manus runtime credentials, storage proxy, API key, or environment variable is required for the local build.

For the production build and local preview:

```bash
npm run check
npm run build
npm run preview
```

The build writes the deployable site to `dist/` and generates static entry points for the policy pages and 404 page. The site uses root-relative asset paths, so the intended hosting target is the root of a domain rather than a GitHub Pages project subdirectory.

Browser checks use a local production preview and synthetic entries:

```bash
npx playwright install chromium
npm run test:e2e
```

The checks do not send appointment requests, email, or SMS.

## Appointment form: delivery is not connected

> **Important:** The appointment popup currently has no submission adapter connected. It must not claim that a request was sent, received, delivered, or confirmed.

The popup contains **Full Name, Phone, Email, and Message**. Full Name, Phone, and Email are required; Message is optional. Appointment-text consent and promotional-text consent are separate, optional checkboxes and are unchecked by default. Neither consent is required to request an appointment.

Until an approved server-side form/CRM adapter is deliberately connected, the form shows a delivery warning and directs visitors to call **(248) 569-6304** or use the existing TrueLark scheduling link. Do not describe the form as a working lead-delivery integration and do not report success without a confirmed server response.

If delivery is later approved and implemented, the confirmed notification recipients are:

- `Southfield.om@guardiandentistry.com`
- `christine@captivizemarketing.com`
- `alex@wm4d.com`

Keep the two SMS choices independent, preserve the exact disclosure/version and audit records, and keep an appointment path available without SMS consent. Do not place a secret CRM key in client code or a public `VITE_` variable.

## Where to edit

| Change | Primary file or folder |
| --- | --- |
| Headline, offer copy, included care, material comparison, approved doctor authority stats, FAQs, patient quotes, gallery references, office hours, and external links | `client/src/pages/Home.tsx` |
| Offer amounts and formatted prices used across the site | `client/src/lib/offerPricing.ts` |
| Shared constants such as `OFFICE_HOURS`, `pricePositions`, `doctorAuthorityStats`, and `faqs` | `client/src/pages/Home.tsx` |
| Colors, responsive layout, motion styles, and font-family variables | `client/src/index.css` |
| Page title, description, social metadata, and Google Fonts link | `client/index.html` |
| Weekly promotion display | `client/src/components/WeeklyPromotionCountdown.tsx` |
| Weekly deadline and Eastern-time calculation | `client/src/lib/promotionTime.ts` |
| Decorative hero video loading, reduced-motion behavior, pause control, and poster fallback | `client/src/components/HeroVideoBackground.tsx` |
| On-scroll authority-number animation | `client/src/components/CountUpNumber.tsx` |
| Appointment fields, validation, delivery warning, SMS disclosures, and consent policy | `client/src/components/AppointmentRequestForm.tsx` |
| Appointment dialog, phone fallback, and TrueLark link | `client/src/components/AppointmentRequestPopup.tsx` |
| Terms of Service and Privacy Policy | `client/src/pages/LegalPages.tsx` |
| Bundled image source files | `client/public/images/` |
| Bundled decorative hero video source files | `client/public/videos/` |

When changing a phone number, price, offer, office hour, policy, or external URL, search the whole page and legal copy for related references. Preserve image consent, before/after labeling, and approved patient-story wording.

### Future price updates

1. In `client/src/lib/offerPricing.ts`, update only the two numerical amounts: `PMMA_PRICE_AMOUNT` and `ZIRCONIA_PRICE_AMOUNT`.
2. Let the helper derive the formatted PMMA and zirconia prices and the upgrade gap automatically; do not hand-edit the formatted values. The current computed upgrade is **$3,000 per arch**.
3. Update the static title, description, and social metadata in `client/index.html` separately; HTML metadata cannot import the TypeScript helper.
4. Update any descriptive price references in this README and `docs/UPDATING-THE-SITE.md`, while keeping Home and legal copy on the shared formatted values.
5. Validate the change with the existing commands: `npm run check`, `npm run build`, and `npm run test:e2e`. The checks use synthetic entries and must not send appointment requests, email, or SMS.

## Hosting intent

The intended deployment target is a root domain on Netlify using the supplied `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 22
- One-year immutable caching is configured for `/images/*` and `/videos/*`. Use a new filename when replacing media so visitors do not receive a stale cached asset.

This is a deployment plan, not a completed deployment. No automatic deployment is configured or claimed yet. GitHub stores the source; pushing code does not publish a website unless a hosting connection is deliberately configured.

## Source of truth and project relationship

For routine edits and pull-request checks in this repository, use the GitHub source as the team’s source of truth. The portable export is **not an automatic two-way Manus sync**: changes here will not update the original Manus/live project automatically, and later edits to that project will not appear here automatically. Transfer or reconcile changes deliberately when the two projects need to match.

See [`docs/UPDATING-THE-SITE.md`](docs/UPDATING-THE-SITE.md) for the client-friendly update checklist.

## Content and asset care

Practice-specific copy, patient imagery, logos, and video should be treated as approved campaign assets, not as generic stock material. Before launch or a major content change, recheck claims, warranty conditions, financing disclosures, image permissions, legal pages, external links, and the still-pending form delivery path.
