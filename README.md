# Southfield Full Arch landing page

Editable React source for the Southfield Family Dental Center full-arch campaign. This is a portable export of the approved website, including the mobile click-to-call footer, automatic patient-case gallery, appointment-request pop-up, Terms of Service, and Privacy Policy.

## Run locally

Install **Node.js 22.12 or later** and use npm:

```bash
git clone https://github.com/Alex-WM4D/southfield-full-arch.git
cd southfield-full-arch
npm ci
npm run dev
```

Open the localhost address printed in the terminal. No Manus credentials, storage proxy, API keys, or environment variables are required to build this version.

## Build and preview

```bash
npm run check
npm run build
npm run preview
```

Deploy the **contents of `dist/`** to the root of a domain on static hosting. The build creates entry files for `/terms-of-service/`, `/privacy-policy/`, `/disclaimer/`, and `/404/`. `_redirects` is supplied for hosts that support SPA fallback rules. If the host uses another format, configure unknown paths to serve `index.html`.

This export uses root-relative paths. Deploy at a domain root, not a GitHub Pages project subdirectory such as `/southfield-full-arch/`, without first configuring the router base and asset paths. GitHub stores the source; pushing code does **not** publish a website. No automatic deployment is configured here.

## Where to edit

| Change | File |
| --- | --- |
| Headlines, prices, included treatment, office hours, FAQs, patient quotes | `client/src/pages/Home.tsx` |
| Colors, fonts, spacing, responsive styling | `client/src/index.css` |
| Google Fonts and search/social metadata | `client/index.html` |
| Appointment pop-up layout, fallback scheduler | `client/src/components/AppointmentRequestPopup.tsx` |
| Appointment fields, validation, optional SMS consent | `client/src/components/AppointmentRequestForm.tsx` |
| Terms of Service and Privacy Policy | `client/src/pages/LegalPages.tsx` |
| Bundled images | `client/public/images/` |

When updating the practice phone number, check `Home.tsx`, both appointment components, and `LegalPages.tsx`. Prices, hours, offers, and policies should stay consistent across the page. For image changes, preserve the original before/after labeling, proportions, and patient consent. Confirm restoration material before adding material-specific case claims.

## Regular updates

```bash
git pull origin main
# Make your edits, then:
npm run check
npm run build
git add .
git commit -m "Describe your landing-page update"
git push origin main
```

For team work, use a feature branch and pull request. CI checks types, builds, and tests the mobile/desktop flow on pushes and pull requests. This repository is an export, **not an automatic two-way Manus sync**. Changes here will not update the original Manus preview unless deliberately transferred back, and later Manus edits will not automatically appear here.

## Appointment form: delivery still pending

The pop-up has Full Name, Phone, Email, and Message. Full Name, Phone, and Email are required. Message is optional. Appointment and promotional SMS consent are independent, optional, and unchecked by default.

**The form does not currently send requests or notifications.** It explains that online submission is not active and never falsely reports success. The main phone and existing TrueLark scheduling link remain available.

To activate it, an approved server-side CRM/form adapter must be passed to `AppointmentRequestForm` through its `submitRequest` prop. The adapter must return a confirmed `{ requestId }`, preserve separate consent choices and exact disclosure/version, and securely retain the relevant audit records. Do not put a secret CRM API key in React code or a `VITE_` environment variable. Server-only notifications should go to:

- Southfield.om@guardiandentistry.com
- christine@captivizemarketing.com
- alex@wm4d.com

No notification routing or messaging provider is connected in this export. A2P registration/approval, opt-in records, and STOP/HELP handling must be verified with the selected provider before sending messages. A request must remain possible without SMS consent.

## Analytics and external services

Managed preview instrumentation and its Umami script are removed. Privacy-safe `southfield:analytics` events remain available for an approved analytics integration; no analytics endpoint is installed in this export. Never record form values in analytics or session replay.

Images are bundled locally and do not need Manus storage. Google Fonts, Google Drive testimonial playback, TrueLark scheduling, and map directions still require internet access. Videos load only when opened. The visual locator map itself is bundled locally.

Before launch, review claims, warranty conditions, financing disclosures, image permissions, and policies with the practice. Update the policy if analytics, delivery, tracking, or messaging behavior changes. Do not deploy inquiry collection until delivery and data handling are ready.

## Browser tests

```bash
npx playwright install chromium
npm run test:e2e
```

Tests use a local production preview and synthetic entries only. They do not send appointments, emails, or SMS. The CI workflow runs these tests on mobile and desktop widths.

## Export notes

Prepared October 12, 2026 from the approved Southfield project. Website copy and design are retained; only portability-related paths, build tooling, unused template files, and managed preview dependencies were changed. `docs/asset-manifest.json` inventories all 12 bundled image assets. The original Manus project remains unchanged.

Practice-specific content and patient imagery are not licensed for unrelated reuse. Public repository visibility does not imply permission to reuse those assets. Third-party dependencies retain their own licenses.
