# AI Ops Map

AI Ops Map is a static diagnostic front end for WebRTC.ventures. It helps communication-heavy operations teams identify the safest first AI workflow to automate across contact center, support, sales conversations, voice workflows, telehealth/media, compliance reviews, and real-time customer experiences.

## What this slice includes

- Vite + React static app suitable for GitHub Pages
- Button-first diagnostic flow with three short scoring questions
- Live result panel that updates as the visitor answers
- Output covering recommended workflow, pilot shape, likely stack, risk controls, and expected payoff
- WebRTC.ventures contact CTA with selected diagnostic context in the URL
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

## GitHub Pages deployment

This repository is configured to publish the committed `docs/` directory with GitHub Pages.

The Vite base path is `/Ai-ops-map/`, and `npm run build` writes the production bundle to `docs/`. After changing the app, run the build and commit the refreshed `docs/` output so Pages serves the latest static assets.

## Next likely slices

- replace URL-param handoff with a real scheduling or lead capture endpoint
- add analytics on answer distribution and CTA conversion
- extend the workflow recommendation engine with richer qualification logic
- add a formal privacy policy page before collecting more sensitive lead context
