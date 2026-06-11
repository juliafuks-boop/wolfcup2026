/**
 * api/sync-results.js
 * Vercel serverless function — called daily by the cron in vercel.json.
 * Fetches all FIFA World Cup 2026 fixtures from football-data.org and
 * overlays real kickoff times, authoritative home/away ordering, status,
 * and scores onto our seeded m1..m104 rows in Supabase.
 *
 * Can also be triggered manually: GET /api/sync-results?key=ADMIN_KEY
 *
 * NOTE: process.env.API_FOOTBALL_KEY holds a football-data.org API token
 * (header: X-Auth-Token), NOT an api-sports.io key.
 */

import { createClient } from '@supabase/supabase-js';

// Our 3-letter code → flag emoji (matches the seed's codes)
const FLAG_MAP = {
  MEX:'🇲🇽', RSA:'🇿🇦', KOR:'🇰🇷', CZE:'🇨🇿',
  CAN:'🇨🇦', BIH:'🇧🇦', QAT:'🇶🇦', SUI:'🇨🇭',
  BRA:'🇧🇷', MAR:'🇲🇦', HAI:'🇭🇹', SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA:'🇺🇸', PAR:'🇵🇾', AUS:'🇦🇺', TUR:'🇹🇷',
  GER:'🇩🇪', CUW:'🇨🇼', CIV:'🇨🇮', ECU:'🇪🇨',
  NED:'🇳🇱', JPN:'🇯🇵', TUN:'🇹🇳', SWE:'🇸🇪',
  BEL:'🇧🇪', EGY:'🇪🇬', IRN:'🇮🇷', NZL:'🇳🇿',
  ESP:'🇪🇸', CPV:'🇨🇻', KSA:'🇸🇦', URU:'🇺🇾',
  FRA:'🇫🇷', SEN:'🇸🇳', NOR:'🇳🇴', IRQ:'🇮🇶',
  ARG:'🇦🇷', ALG:'🇩🇿', AUT:'🇦🇹', JOR:'🇯🇴',
  POR:'🇵🇹', UZB:'🇺🇿', COL:'🇨🇴', COD:'🇨🇩',
  ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', CRO:'🇭🇷', GHA:'🇬🇭', PAN:'🇵🇦',
};

// football-data.org tla → our seed code (only where they differ)
const CODE_ALIAS = { CUR:'CUW', URY:'URU' };
const ourCode = tla => tla ? (CODE_ALIAS[tla] || tla) : null;
const toFlag  = code => FLAG_MAP[code] || '🏳️';

const STAGE_MAP = {
  GROUP_STAGE:'group', LAST_32:'r32', LAST_16:'r16',
  QUARTER_FINALS:'qf', SEMI_FINALS:'sf', THIRD_PLACE:'3rd', FINAL:'final',
};

function statusOf(s) {
  if (['FINISHED', 'AWARDED'].includes(s)) return 'completed';
  if (['IN_PLAY', 'PAUSED'].includes(s))   return 'live';
  return 'upcoming';
}

// Build the partial update for one of our rows from an API fixture.
// Omitted columns (stadium, city, etc.) are preserved by the upsert.
function buildPatch(id, f, hc, ac) {
  const status = statusOf(f.status);
  const patch = { id, kickoff_utc: f.utcDate, status };
  if (f.matchday) patch.matchday = f.matchday;
  if (hc && f.homeTeam && f.homeTeam.name) {
    patch.home_name = f.homeTeam.name; patch.home_code = hc; patch.home_flag = toFlag(hc);
  }
  if (ac && f.awayTeam && f.awayTeam.name) {
    patch.away_name = f.awayTeam.name; patch.away_code = ac; patch.away_flag = toFlag(ac);
  }
  if (status === 'completed' || status === 'live') {
    patch.home_score = (f.score && f.score.fullTime) ? (f.score.fullTime.home ?? null) : null;
    patch.away_score = (f.score && f.score.fullTime) ? (f.score.fullTime.away ?? null) : null;
  }
  return patch;
}

export default async function handler(req, res) {
  const isCron   = req.headers['x-vercel-cron'] === '1';
  const isManual = req.query.key === process.env.ADMIN_KEY;
  if (!isCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch all WC 2026 fixtures from football-data.org
  let apiMatches;
  try {
    const apires = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      { headers: { 'X-Auth-Token': process.env.API_FOOTBALL_KEY } }
    );
    const json = await apires.json();
    apiMatches = json.matches;
  } catch (err) {
    return res.status(502).json({ error: 'football-data.org fetch failed', detail: err.message });
  }

  if (!Array.isArray(apiMatches) || apiMatches.length === 0) {
    return res.status(200).json({ message: 'No fixtures returned from API', count: 0 });
  }

  // Load our seeded rows IN FULL — Supabase upsert runs as INSERT ... ON
  // CONFLICT, so every NOT NULL column must be present in each row. We merge
  // each API patch onto the complete existing row before upserting.
  const { data: ourMatches, error: loadErr } = await supabase
    .from('matches').select('*');
  if (loadErr) return res.status(500).json({ error: loadErr.message });

  const fullById = {};
  for (const m of ourMatches) fullById[m.id] = m;

  // Each team-pair plays exactly once in the group stage, and pairs never
  // repeat across groups — so the unordered pair alone is a unique key.
  // (Matching on matchday too would miss fixtures the seed mis-dated.)
  const pairKey = (a, b) => [a, b].sort().join('-');

  // Index: group matches by unordered team-pair; everything by stage.
  const ourGroupByKey = {};
  const ourByStage = {};
  for (const m of ourMatches) {
    if (m.round === 'group') {
      ourGroupByKey[pairKey(m.home_code, m.away_code)] = m;
    }
    (ourByStage[m.round] = ourByStage[m.round] || []).push(m);
  }
  for (const k in ourByStage) {
    ourByStage[k].sort((a, b) => parseInt(a.id.slice(1), 10) - parseInt(b.id.slice(1), 10));
  }

  const upserts = [];
  const apiByStage = {};

  // Group stage: match by team-pair + matchday (handles home/away swaps).
  for (const f of apiMatches) {
    const round = STAGE_MAP[f.stage] || 'group';
    (apiByStage[round] = apiByStage[round] || []).push(f);
    if (round !== 'group') continue;

    const hc = ourCode(f.homeTeam && f.homeTeam.tla);
    const ac = ourCode(f.awayTeam && f.awayTeam.tla);
    if (!hc || !ac) continue;
    const match = ourGroupByKey[pairKey(hc, ac)];
    if (!match) continue;
    upserts.push({ ...fullById[match.id], ...buildPatch(match.id, f, hc, ac) });
  }

  // Knockouts: teams are undecided until the bracket fills, so zip each
  // stage's fixtures by kickoff time. This sets kickoff_utc/status/scores
  // now and resolves real teams automatically once the API knows them.
  for (const round of ['r32', 'r16', 'qf', 'sf', '3rd', 'final']) {
    const ours = ourByStage[round] || [];
    const apis = (apiByStage[round] || []).slice()
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    for (let i = 0; i < ours.length && i < apis.length; i++) {
      const f = apis[i];
      const hc = ourCode(f.homeTeam && f.homeTeam.tla);
      const ac = ourCode(f.awayTeam && f.awayTeam.tla);
      upserts.push({ ...fullById[ours[i].id], ...buildPatch(ours[i].id, f, hc, ac) });
    }
  }

  if (upserts.length === 0) {
    return res.status(200).json({ message: 'Nothing to update', count: 0 });
  }

  const { error } = await supabase.from('matches').upsert(upserts, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ message: 'Synced', count: upserts.length });
}
