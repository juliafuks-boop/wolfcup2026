/**
 * api/sync-results.js
 * Vercel serverless function — called hourly by the cron in vercel.json.
 * Fetches all World Cup 2026 fixtures from API-Football and upserts
 * scores, status, kickoff times, and resolved team names into Supabase.
 *
 * Can also be triggered manually: GET /api/sync-results?key=ADMIN_KEY
 */

import { createClient } from '@supabase/supabase-js';

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

// Normalise team name → our code (handles API name variations)
const NAME_TO_CODE = {
  'Mexico':'MEX','South Africa':'RSA','South Korea':'KOR','Korea Republic':'KOR',
  'Czechia':'CZE','Czech Republic':'CZE','Canada':'CAN','Bosnia':'BIH',
  'Bosnia and Herzegovina':'BIH','Bosnia & Herzegovina':'BIH',
  'Qatar':'QAT','Switzerland':'SUI','Brazil':'BRA','Morocco':'MAR',
  'Haiti':'HAI','Scotland':'SCO','USA':'USA','United States':'USA',
  'Paraguay':'PAR','Australia':'AUS','Turkey':'TUR','Türkiye':'TUR',
  'Germany':'GER','Curaçao':'CUW','Curacao':'CUW',"Côte d'Ivoire":'CIV',
  "Cote d'Ivoire":'CIV','Ivory Coast':'CIV','Ecuador':'ECU',
  'Netherlands':'NED','Japan':'JPN','Tunisia':'TUN','Sweden':'SWE',
  'Belgium':'BEL','Egypt':'EGY','Iran':'IRN','New Zealand':'NZL',
  'Spain':'ESP','Cabo Verde':'CPV','Cape Verde':'CPV','Saudi Arabia':'KSA',
  'Uruguay':'URU','France':'FRA','Senegal':'SEN','Norway':'NOR','Iraq':'IRQ',
  'Argentina':'ARG','Algeria':'ALG','Austria':'AUT','Jordan':'JOR',
  'Portugal':'POR','Uzbekistan':'UZB','Colombia':'COL','Congo DR':'COD',
  'DR Congo':'COD','England':'ENG','Croatia':'CRO','Ghana':'GHA','Panama':'PAN',
};

function toCode(name) { return NAME_TO_CODE[name] || name.toUpperCase().slice(0,3); }
function toFlag(code) { return FLAG_MAP[code] || '🏳️'; }

function apiStatusToOurs(s) {
  if (['FT','AET','PEN','AWD','WO'].includes(s)) return 'completed';
  if (['1H','HT','2H','ET','BT','P','SUSP','INT','LIVE'].includes(s)) return 'live';
  return 'upcoming';
}

export default async function handler(req, res) {
  // Allow manual trigger with admin key, or from Vercel cron (no auth header needed on cron)
  const isCron = req.headers['x-vercel-cron'] === '1';
  const isManual = req.query.key === process.env.ADMIN_KEY;
  if (!isCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch all WC 2026 fixtures from API-Football
  let apiFixtures;
  try {
    const apires = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026',
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY } }
    );
    const json = await apires.json();
    apiFixtures = json.response;
  } catch (err) {
    return res.status(502).json({ error: 'API-Football fetch failed', detail: err.message });
  }

  if (!Array.isArray(apiFixtures) || apiFixtures.length === 0) {
    return res.status(200).json({ message: 'No fixtures returned from API', count: 0 });
  }

  // Load our matches so we can map api_fixture_id → match id
  const { data: ourMatches } = await supabase.from('matches').select('id,home_code,away_code,matchday,round,api_fixture_id');

  // Build lookup: by api_fixture_id first (fast path for re-runs), then by teams+matchday
  const byApiId = {};
  const byTeamMatchday = {};
  for (const m of ourMatches) {
    if (m.api_fixture_id) byApiId[m.api_fixture_id] = m;
    // Key: "homeCode-awayCode-matchday" for group games, "homeCode-awayCode-round" for KO
    const key = `${m.home_code}-${m.away_code}-${m.matchday || m.round}`;
    byTeamMatchday[key] = m;
  }

  const upserts = [];

  for (const f of apiFixtures) {
    const fix = f.fixture;
    const teams = f.teams;
    const goals = f.goals;
    const league = f.league;

    const homeCode = toCode(teams.home.name);
    const awayCode = toCode(teams.away.name);
    const apiRound = (league.round || '').toLowerCase();
    // Derive matchday number from "Group Stage - 1" style strings
    const mdMatch = apiRound.match(/(\d+)$/);
    const matchday = mdMatch ? parseInt(mdMatch[1]) : 0;

    // Derive our round label
    let round = 'group';
    if (apiRound.includes('round of 32'))    round = 'r32';
    else if (apiRound.includes('round of 16')) round = 'r16';
    else if (apiRound.includes('quarter'))    round = 'qf';
    else if (apiRound.includes('semi'))       round = 'sf';
    else if (apiRound.includes('3rd'))        round = '3rd';
    else if (apiRound.includes('final'))      round = 'final';

    const keyForKO  = `${homeCode}-${awayCode}-${round}`;
    const keyForGrp = `${homeCode}-${awayCode}-${matchday}`;

    let matched = byApiId[fix.id]
      || byTeamMatchday[keyForGrp]
      || byTeamMatchday[keyForKO];

    if (!matched) continue; // fixture not in our list yet (e.g., venue TBDs)

    const status = apiStatusToOurs(fix.status.short);
    const patch = {
      id:             matched.id,
      api_fixture_id: fix.id,
      kickoff_utc:    fix.date,
      status,
      home_name: teams.home.name,
      home_code: homeCode,
      home_flag: toFlag(homeCode),
      away_name: teams.away.name,
      away_code: awayCode,
      away_flag: toFlag(awayCode),
    };
    if (status === 'completed' || status === 'live') {
      patch.home_score = goals.home ?? null;
      patch.away_score = goals.away ?? null;
    }
    upserts.push(patch);
  }

  if (upserts.length === 0) {
    return res.status(200).json({ message: 'Nothing to update', count: 0 });
  }

  const { error } = await supabase.from('matches').upsert(upserts, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ message: 'Synced', count: upserts.length });
}
