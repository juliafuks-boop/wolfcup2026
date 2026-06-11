/**
 * api/admin-result.js
 * Vercel serverless function for admin match-result entry.
 *
 *   HEAD  /api/admin-result?key=X   → 200 OK (key valid) or 401
 *   POST  /api/admin-result?key=X   → write result to Supabase
 *   Body (POST): { matchId, homeScore, awayScore }
 *
 * ADMIN_KEY must be set as a Vercel env var.
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const key = req.query.key || '';
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'HEAD') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { matchId, homeScore, awayScore, reset } = req.body || {};
  if (!matchId) return res.status(400).json({ error: 'Missing matchId' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Reset (admin edit) — clear result so predictions reopen
  if (reset) {
    const { error } = await supabase.from('matches').update({
      home_score: null, away_score: null, status: 'upcoming',
    }).eq('id', matchId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (homeScore == null || awayScore == null) {
    return res.status(400).json({ error: 'Missing score fields' });
  }
  if (homeScore < 0 || homeScore > 20 || awayScore < 0 || awayScore > 20) {
    return res.status(400).json({ error: 'Score out of range' });
  }

  const { error } = await supabase.from('matches').update({
    home_score: homeScore,
    away_score: awayScore,
    status: 'completed',
  }).eq('id', matchId);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
