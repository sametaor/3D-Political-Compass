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

No API keys required.

## Anti-bias safeguards

- Minimum 2 ideology tags required before any coordinate update
- Maximum 3.0-point shift per axis (outlier protection)
- Minimum 0.5-point delta required (noise floor)
- Ideology centroids sourced from ≥3 independent academic works

## To-Do List
- [ ] Add swappable axes to accomodate 4+ axes
- [ ] Add country/city display based on data of political party
- [ ] Add Self-Updation mechanism
