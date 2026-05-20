# Global Political Compass — 3D

A fully interactive 3D political compass visualising 957 parties across 184 countries on three axes:

- **X (P) — Political/Cultural:** Progressive ↔ Conservative
- **Y (S) — Social/Governance:** Libertarian ↔ Authoritarian  
- **Z (E) — Economic:** Planned ↔ Free Market

## Data sources

- **CHES 2024** — Chapel Hill Expert Survey (609 experts, 31 EU+nearby countries)
- **GPS 2019** — Global Party Survey (Norris, Harvard; 163 countries)
- **V-Party Dataset** — V-Dem Institute (169 countries)
- **Manifesto Project** — WZB Berlin (annual manifesto coding)
- **V-Dem v14** — Varieties of Democracy
- **Freedom House 2024**, **BTI 2024**, **ICG**

Parties without expert-survey coverage are marked `*` (estimated).

## Deployment

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/global-political-compass)

### Manual

1. Fork/clone this repo
2. `npm i -g vercel && vercel --prod`

## Server-side update system

The `⚙ Settings` panel → **Enable server-side data updates** toggle activates monthly
automatic updates via two Vercel serverless functions:

| Endpoint | Purpose |
|---|---|
| `GET /api/surveys` | Checks Dataverse + Zenodo for new expert survey versions |
| `POST /api/ideologies` | Queries Wikidata SPARQL for party ideology tags (P1142) |

No API keys required. Updates run once per calendar month automatically, or on demand
via the **Run update now** button. A full change log is kept in `localStorage`.

## Anti-bias safeguards

- Minimum 2 ideology tags required before any coordinate update
- Maximum 3.0-point shift per axis (outlier protection)
- Minimum 0.5-point delta required (noise floor)
- Ideology centroids sourced from ≥3 independent academic works
