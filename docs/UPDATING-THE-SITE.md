# Updating the Southfield site

This guide is for routine copy, asset, and layout updates to the portable Southfield Full Arch landing page. For this repository, use the GitHub source as the source of truth for regular edits, pull requests, and checks. The original managed/live project is separate and does not sync automatically with this folder.

Repository: `https://github.com/Alex-WM4D/southfield-full-arch-v2`. Clone it into a local folder named `southfield-full-arch-v2`. GitHub stores the source; a hosting connection is required to publish updates.

The export contains 25 frontend source files (including the shared offer-pricing helper) and 16 media assets (14 images and 2 videos). `docs/asset-manifest.json` is the inventory for the bundled media.

## Before editing

1. Confirm the requested change and the approved wording or asset with the practice/client.
2. Work from the repository source and use a feature branch/pull request for team review.
3. Check whether the change affects the page copy, a legal policy, an external link, the appointment warning, or a patient asset.
4. Do not turn a marketing statement into a clinical inference. Preserve qualified language such as “individual patient experiences and results vary.”

## Source map

| Need | Edit here | Notes |
| --- | --- | --- |
| Hero headline, current offer copy, inclusions, material comparison, approved claims, FAQs, quotes, gallery, office hours, and links | `client/src/pages/Home.tsx` | The current headline is “Restore Your Confidence With Dental Implants.” Keep the shared formatted prices consistent. |
| Offer amounts and formatted prices | `client/src/lib/offerPricing.ts` | Update only `PMMA_PRICE_AMOUNT` and `ZIRCONIA_PRICE_AMOUNT`; the formatted prices and computed upgrade gap update automatically. |
| Shared campaign constants | `client/src/pages/Home.tsx` | Review `OFFICE_HOURS`, `pricePositions`, `doctorAuthorityStats`, and `faqs` together when changing related content. |
| Dr. Oleg authority metrics | `client/src/pages/Home.tsx` plus `client/src/components/CountUpNumber.tsx` | Current approved figures include 26+ years and 1,000+ implants placed. The numbers animate from zero when the panel scrolls into view; update the source figure and its label together. |
| Weekly promotion deadline | `client/src/components/WeeklyPromotionCountdown.tsx` and `client/src/lib/promotionTime.ts` | The shared rule is the next Sunday at 11:59 PM Eastern (`America/Detroit`). Do not replace it with a visitor-local hardcoded date. |
| Hero motion media | `client/src/components/HeroVideoBackground.tsx` and `client/src/pages/Home.tsx` | Keep separate desktop/mobile MP4 paths, the poster fallback, reduced-motion/data-saving fallback, and pause control. The decorative video is deferred until after initial page load/idle time; it is not the only place where the offer is explained. |
| Patient cases and other imagery | `client/public/images/` and the references in `Home.tsx` | Keep supplied filenames/paths, accurate alt text, consent, and before/after context. The current hero patient-story thumbnail is Troy’s supplied thumbnail. |
| Hero videos | `client/public/videos/` and the `HeroVideoBackground` props in `Home.tsx` | Keep the optimized desktop/mobile files local; do not silently replace them with an external storage URL. Because images/videos use one-year immutable caching, use a new filename when replacing media. |
| Visual design and fonts | `client/src/index.css` | Update colors, spacing, responsive rules, motion styles, and font-family variables here. |
| Document title, metadata, and Google Fonts | `client/index.html` | Google Fonts remain an external dependency; check the title and description when the offer changes. |
| Appointment form behavior and policy | `client/src/components/AppointmentRequestForm.tsx` | Preserve Full Name, Phone, Email, Message, validation, the prominent delivery warning, and two independent optional SMS consents. |
| Appointment dialog and fallbacks | `client/src/components/AppointmentRequestPopup.tsx` | Keep the phone fallback and TrueLark scheduling link available. |
| Terms and privacy wording | `client/src/pages/LegalPages.tsx` | Recheck this page whenever collection, analytics, SMS, delivery, or external services change. |

## Routine content checklist

- [ ] Confirm all prices are still per arch and still approved: $14,990 PMMA, $17,990 final zirconia, and $3,000 more for final zirconia.
- [ ] Keep included-care, warranty, financing, and sedation wording qualified and consistent across the hero, comparison cards, FAQs, and inclusions.
- [ ] Treat the 26+ years and 1,000+ implants figures as approved claims. Confirm the source/date before changing them; do not add clinical conclusions.
- [ ] Confirm the weekly promotion still ends Sunday at 11:59 PM Eastern. If the campaign rule changes, update the shared time helper and its display together.
- [ ] Keep the patient gallery autoplay behavior, reduced-motion handling, and manual controls usable. Do not imply that a gallery image guarantees a result.
- [ ] Keep Troy’s current supplied thumbnail unless an approved replacement is provided. Check the thumbnail alt text and patient-story link together.
- [ ] For new images or videos, add the file under `client/public/images/` or `client/public/videos/`, use a new filename when replacing an existing cached asset, update the component reference, preserve meaningful alt text/poster behavior, and update `docs/asset-manifest.json` if the inventory changes.
- [ ] Recheck external Google Fonts, Google Drive playback, TrueLark scheduling, directions, and any changed URL in a browser with internet access. Google Drive testimonial videos should load on click/open rather than during initial page load.

## Future price updates

For a routine offer-price change, keep the source of truth small and explicit:

1. Open `client/src/lib/offerPricing.ts` and change only the two numerical amounts, `PMMA_PRICE_AMOUNT` and `ZIRCONIA_PRICE_AMOUNT`.
2. Do not manually change the formatted price strings or upgrade text in components. The helper computes the difference automatically; the current upgrade is **$3,000 per arch**.
3. Separately update the static title, description, and social metadata in `client/index.html`, then update descriptive price references in this README and this guide.
4. Confirm the shared values are reflected in Home and legal copy, and search the whole page for related references. Preserve approved claims, qualified material language, and all form/consent safeguards.
5. Run the existing validation sequence from the repository root:

   ```bash
   npm run check
   npm run build
   npm run test:e2e
   ```

   These checks use synthetic entries only; no test or manual check may submit a real appointment, email, or SMS.

## Appointment form safeguards

The form is intentionally not connected to a submission adapter in this export. Keep this notice prominent:

> Online submission is not active yet. Visitors must be directed to the office phone or the existing online scheduling link. Never claim that a request was sent, received, delivered, or confirmed.

The fields are Full Name, Phone, Email, and Message. Full Name, Phone, and Email are required; Message is optional. Appointment texts and promotional texts are separate optional consents, unchecked by default, and neither is required to request an appointment.

If a delivery integration is approved later, it must provide a real server-side confirmation before the UI reports receipt. Preserve the independent consent choices and exact disclosure/version. The confirmed notification recipients are:

- `Southfield.om@guardiandentistry.com`
- `christine@captivizemarketing.com`
- `alex@wm4d.com`

Do not put a secret CRM or messaging key in the browser bundle or a public `VITE_` variable. Keep a non-SMS path available. Review the Terms of Service and Privacy Policy before enabling collection or messaging.

## Local validation

From the repository root, use Node.js 22.12 or later:

```bash
npm ci
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

For visual review, run:

```bash
npm run dev
```

Also review the production output with:

```bash
npm run preview
```

Before opening a pull request, check both mobile and desktop widths and confirm:

- The hero headline, offer, prices, inclusions, and $3,000 upgrade are readable without relying on video.
- The decorative hero video uses the correct desktop/mobile file, does not block the page, and falls back for reduced motion or a constrained connection.
- The promotion timer uses Eastern time and rolls forward correctly after the deadline.
- The case gallery advances automatically, can be paused/controlled, and respects reduced motion.
- The 26+ and 1,000+ authority figures appear correctly when scrolled into view.
- The appointment popup keeps the delivery warning, required fields, independent optional consents, phone fallback, and TrueLark link.
- No test or manual check sends an appointment, email, or SMS.

## Pull request and deployment boundaries

A pull request should include the reason for the change, the files changed, and the results of `npm run check`, `npm run build`, and `npm run test:e2e`. Keep generated `dist/`, Playwright reports, and test results out of the commit.

The intended Netlify setup uses the supplied `netlify.toml` with `npm run build`, Node 22, and `dist` as the publish directory. It applies one-year immutable caching to `/images/*` and `/videos/*`, so media replacements need new filenames. Deployment is not automatic yet and is not implied by a GitHub push. Confirm the hosting connection and review the built site before treating any change as live.

Do not edit both this repository and the original managed/live project for the same routine change without choosing which one is authoritative and deliberately transferring the other change. GitHub and the managed project are not automatic two-way mirrors.
