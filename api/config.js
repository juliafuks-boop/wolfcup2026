/**
 * api/config.js
 * Returns public Supabase config to the browser so no values need to be
 * hard-coded in index.html. Only exposes the ANON key (safe with RLS).
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json({
    supabaseUrl:     process.env.SUPABASE_URL      || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  });
}
