# AI Ops Map

AI Ops Map is a static diagnostic front end that helps a visitor discover the safest first managed AI workflow to automate. It is designed as a productized front door for managed agentic automation services, not as a generic landing page or long form.

## What this first slice includes

- Vite + React static app suitable for GitHub Pages
- Button-first diagnostic flow with four short questions
- Live result panel that updates as the visitor answers
- Output covering recommended workflow, pilot shape, risk controls, and what the delivery team handles
- Lightweight corporate email capture field and placeholder CTA for a Blueprint Sprint

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages deployment

A Pages workflow is included under `.github/workflows/deploy.yml`.

The Vite base path is configured for the repository name `Ai-ops-map`, so the static build works when deployed to the default project Pages URL.

## Next likely slices

- replace the placeholder CTA with a real scheduling or lead capture endpoint
- add downloadable summary output or email follow-up handoff
- add analytics on answer distribution and CTA conversion
- extend the workflow recommendation engine with richer qualification logic
