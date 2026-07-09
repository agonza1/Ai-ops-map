# AI Ops Map

AI Ops Map is a static diagnostic front end for WebRTC.ventures. It helps communication-heavy operations teams identify the safest first AI workflow to automate across contact center, support, sales conversations, voice workflows, telehealth/media, compliance reviews, and real-time customer experiences.

## What this slice includes

- Vite + React static app suitable for GitHub Pages
- Button-first progressive diagnostic flow
- Live result panel that updates as the visitor answers
- Output covering recommended workflow, pilot shape, likely stack, risk controls, and expected payoff
- Work email, company, and consent-gated lead capture through a serverless endpoint or HubSpot form
- Scheduler handoff after successful submission
- Funnel event tracking for assessment progress, lead submission, scheduler opens, and bookings
- Basic SEO metadata, Open Graph data, structured data, and a public social image
- Unit tests for recommendation paths and diagnostic choice readability

## Local development

```bash
npm install
npm run dev
```

## Test and build

```bash
npm run lint
npm test
npm run build
```

## Lead capture configuration

GitHub Pages stays static. Do not put CRM or HubSpot secrets in this app. Configure one of these public handoffs at build time:

- `VITE_LEAD_CAPTURE_ENDPOINT`: thin serverless endpoint that receives the structured JSON payload and writes to HubSpot/CRM with server-side secrets.
- `VITE_HUBSPOT_PORTAL_ID` and `VITE_HUBSPOT_FORM_ID`: browser-safe HubSpot Forms submission fallback. Set `VITE_HUBSPOT_SUBSCRIPTION_TYPE_ID` if the portal requires a communication subscription ID.

Optional public settings:

- `VITE_ANALYTICS_ENDPOINT`: receives funnel event JSON. The app also pushes events to `dataLayer`, `gtag`, and Plausible when available.
- `VITE_SCHEDULER_URL`: booking link or embeddable scheduler URL shown only after successful lead capture.

## GitHub Pages deployment

This repository is configured to publish the committed `docs/` directory with GitHub Pages.

The Vite base path is `/Ai-ops-map/`, and `npm run build` writes the production bundle to `docs/`. After changing the app, run the build and commit the refreshed `docs/` output so Pages serves the latest static assets.

## Next likely slices

- connect the production serverless endpoint to the CRM workflow
- extend the workflow recommendation engine with richer qualification logic
- add a formal privacy policy page before collecting more sensitive lead context
