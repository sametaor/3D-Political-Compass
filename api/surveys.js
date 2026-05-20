// api/surveys.js — Vercel serverless function
// Checks version metadata for 4 expert survey datasets
// No API keys needed; all endpoints are public
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  // Allow CORS from same origin only
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=86400'); // cache 24h at edge

  const SURVEYS = [
    {
      id: 'GPS',
      name: 'Global Party Survey (Norris, Harvard)',
      lastKnown: '2020-04-01',
      cycleDays: 1460,
      fetch: async () => {
        const r = await fetch(
          'https://dataverse.harvard.edu/api/datasets/:persistentId/versions'
          + '?persistentId=doi:10.7910/DVN/WMGTNS&includeDeaccessioned=false',
          { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
        );
        if (!r.ok) return null;
        const d = await r.json();
        const released = (d.data || []).filter(v => v.versionState === 'RELEASED')
          .sort((a, b) => new Date(b.releaseTime) - new Date(a.releaseTime));
        if (!released.length) return null;
        const v = released[0];
        return { ver: `v${v.versionNumber}.${v.versionMinorNumber}`, date: v.releaseTime };
      },
    },
    {
      id: 'CHES',
      name: 'Chapel Hill Expert Survey',
      lastKnown: '2025-01-01',
      cycleDays: 1825,
      fetch: async () => {
        const r = await fetch(
          'https://zenodo.org/api/records?q=%22Chapel+Hill+Expert+Survey%22'
          + '&sort=mostrecent&size=1&type=dataset',
          { signal: AbortSignal.timeout(8000) }
        );
        if (!r.ok) return null;
        const d = await r.json();
        const rec = d.hits?.hits?.[0];
        return rec ? { ver: rec.metadata?.version || String(rec.id),
                       date: rec.metadata?.publication_date || rec.created } : null;
      },
    },
    {
      id: 'VPARTY',
      name: 'V-Party Dataset (V-Dem)',
      lastKnown: '2020-07-01',
      cycleDays: 730,
      fetch: async () => {
        const r = await fetch(
          'https://zenodo.org/api/records?q=V-Party+vdem&sort=mostrecent&size=1&type=dataset',
          { signal: AbortSignal.timeout(8000) }
        );
        if (!r.ok) return null;
        const d = await r.json();
        const rec = d.hits?.hits?.[0];
        return rec ? { ver: rec.metadata?.version || String(rec.id),
                       date: rec.metadata?.publication_date || rec.created } : null;
      },
    },
    {
      id: 'MARPOR',
      name: 'Manifesto Project (WZB)',
      lastKnown: '2024-09-01',
      cycleDays: 365,
      fetch: async () => {
        const r = await fetch(
          'https://zenodo.org/api/records?q=%22Manifesto+Corpus%22+WZB'
          + '&sort=mostrecent&size=1&type=dataset',
          { signal: AbortSignal.timeout(8000) }
        );
        if (!r.ok) return null;
        const d = await r.json();
        const rec = d.hits?.hits?.[0];
        return rec ? { ver: rec.metadata?.version || String(rec.id),
                       date: rec.metadata?.publication_date || rec.created } : null;
      },
    },
  ];

  const results = {};
  for (const sv of SURVEYS) {
    try {
      const data = await sv.fetch();
      results[sv.id] = {
        name: sv.name,
        lastKnown: sv.lastKnown,
        cycleDays: sv.cycleDays,
        ...(data || {}),
        ok: !!data,
      };
    } catch (e) {
      results[sv.id] = {
        name: sv.name,
        lastKnown: sv.lastKnown,
        cycleDays: sv.cycleDays,
        ok: false,
        error: e.message,
      };
    }
  }

  return res.status(200).json({ surveys: results, checkedAt: new Date().toISOString() });
}
