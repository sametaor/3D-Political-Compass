// api/ideologies.js — Vercel serverless function
// Queries Wikidata SPARQL for P1142 (political ideology) tags.
// Called server-side so no CORS restrictions apply.
// Accepts: POST { countryQIDs: string[] }  (batch of up to 20 country Q-IDs)
// Returns: { ideologies: { partyLabel: [qid, ...] } }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Content-Type', 'application/json');

  let body;
  try { body = typeof req.body === 'object' ? req.body : JSON.parse(req.body); }
  catch { return res.status(400).json({ error: 'Invalid JSON body' }); }

  const { countryQIDs } = body || {};
  if (!Array.isArray(countryQIDs) || !countryQIDs.length) {
    return res.status(400).json({ error: 'countryQIDs must be a non-empty array' });
  }

  // Sanitise: only valid Wikidata Q-IDs allowed
  const safe = countryQIDs
    .filter(q => /^Q\d+$/.test(String(q).trim()))
    .slice(0, 20)
    .map(q => String(q).trim());

  if (!safe.length) return res.status(400).json({ error: 'No valid Q-IDs supplied' });

  const vals = safe.map(q => `wd:${q}`).join(' ');

  // SPARQL: for each party in these countries fetch all P1142 ideology tags.
  // GROUP_CONCAT collapses multiple ideology tags into one row per party.
  const sparql = `
SELECT ?party ?partyLabel ?countryLabel
  (GROUP_CONCAT(DISTINCT STRAFTER(STR(?ideo),"/entity/"); separator=",") AS ?ideologyList)
WHERE {
  ?party wdt:P31 wd:Q7278 ; wdt:P17 ?country .
  VALUES ?country { ${vals} }
  OPTIONAL { ?party wdt:P1142 ?ideo . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
GROUP BY ?party ?partyLabel ?countryLabel
LIMIT 500`.trim();

  try {
    const r = await fetch(
      'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql),
      {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'GlobalPoliticalCompass/2.0 (vercel serverless; research tool)',
        },
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!r.ok) {
      return res.status(502).json({ error: `Wikidata returned HTTP ${r.status}` });
    }

    const data = await r.json();
    const ideologies = {};

    for (const b of (data.results?.bindings || [])) {
      const label  = b.partyLabel?.value || '';
      const rawIds = b.ideologyList?.value || '';
      const ids    = rawIds.split(',').filter(x => /^Q\d+$/.test(x));
      if (label && ids.length) ideologies[label] = ids;
    }

    return res.status(200).json({
      ideologies,
      countries: safe.length,
      parties: Object.keys(ideologies).length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
