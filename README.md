# Wolf Cup 2026

Internal World Cup 2026 prediction competition for Overwolf colleagues.

## What it does

- Anyone visits the URL, enters their name, picks a World Cup winner
- They predict the outcome + exact score of any match before kickoff
- Points: **+1 correct winner · +2 exact score** (max 3 per match)
- Real-time shared leaderboard — everyone sees the same standings
- Match results sync automatically every hour from the API-Football live feed

---

## Setup (one-time, ~15 minutes)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and two keys:
   - **anon / public key** (safe to expose in browser)
   - **service_role key** (secret — server only)
3. In the Supabase dashboard → **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.

### 2. Get an API-Football key

1. Go to [api-football.com](https://www.api-football.com) (or via RapidAPI)
2. Sign up for a free account → copy your **API key**
3. Free tier: 100 requests/day — the hourly cron uses ≤ 24/day, so you're fine

### 3. Deploy to Vercel

1. Push this folder to a **GitHub repo**
2. Go to [vercel.com](https://vercel.com) → Import the repo
3. In **Settings → Environment Variables**, add all 5 vars:

   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | Supabase anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (keep secret) |
   | `API_FOOTBALL_KEY` | Your API-Football key |
   | `ADMIN_KEY` | A password of your choosing (e.g. `wolfcup2026`) |

4. Deploy. Vercel will automatically schedule the hourly results sync.

### 4. Seed the match fixtures

Once deployed (or locally with env vars set):

```bash
npm install
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
```

This populates the `matches` table with all 104 WC2026 fixtures. Run it once.

### 5. Share the URL

Send the Vercel URL to your colleagues. That's it.

---

## Admin access

- Click **Admin** in the footer (or nav) → enter your `ADMIN_KEY`
- From the admin panel you can:
  - **Enter match results manually** (backup if the API lags)
  - **Trigger an immediate API sync** (normally runs hourly automatically)

---

## Running locally (optional)

```bash
npm install
vercel dev
```

You'll need Vercel CLI installed (`npm i -g vercel`) and a `.env.local` file:

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
API_FOOTBALL_KEY=...
ADMIN_KEY=wolfcup2026
```

---

## Project structure

```
public/index.html          The app (all UI — CSS, HTML, JavaScript)
api/
  config.js                Returns Supabase public config to the browser
  sync-results.js          Vercel cron: hourly API-Football → Supabase sync
  admin-result.js          Admin result entry (server-side write)
supabase/schema.sql        Tables, RLS policies, leaderboard view
scripts/seed-matches.mjs   One-time fixture seed
vercel.json                Cron schedule (hourly)
```

## Scoring rules

| Prediction | Points |
|---|---|
| Correct winner (or draw) | +1 |
| Exact final score | +2 |
| **Maximum per match** | **3** |

Predictions lock at kickoff (enforced both client-side and by the database).
