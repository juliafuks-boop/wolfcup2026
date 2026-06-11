-- Wolf Cup 2026 — Supabase schema
-- Run this in your Supabase SQL editor (Database → SQL Editor → New query)

-- ─────────────────────────────────────────────
--  matches
-- ─────────────────────────────────────────────
create table if not exists matches (
  id              text primary key,          -- 'm1' … 'm104'
  api_fixture_id  bigint,
  round           text    not null,          -- 'group','r32','r16','qf','sf','3rd','final'
  "group"         text    default '',
  matchday        int     default 0,
  home_name       text    not null,
  home_flag       text    not null,
  home_code       text    not null,
  away_name       text    not null,
  away_flag       text    not null,
  away_code       text    not null,
  stadium         text    not null,
  city            text    not null,
  date_label      text    not null,          -- 'Jun 11' (display only)
  time_label      text    not null,          -- '15:00' (display only)
  kickoff_utc     timestamptz,               -- authoritative — set by sync job
  home_score      int,
  away_score      int,
  status          text    not null default 'upcoming'  -- 'upcoming','live','completed'
);

-- Public read; only service_role may write
alter table matches enable row level security;
create policy "matches_select" on matches for select using (true);
create policy "matches_insert_service" on matches for insert with check (auth.role() = 'service_role');
create policy "matches_update_service" on matches for update using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
--  players
-- ─────────────────────────────────────────────
create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  dept        text not null default '',
  country     text not null,
  flag        text not null,
  initials    text not null,
  created_at  timestamptz default now()
);

alter table players enable row level security;
create policy "players_select" on players for select using (true);
create policy "players_insert" on players for insert with check (true);
create policy "players_update_own" on players for update using (true);

-- ─────────────────────────────────────────────
--  predictions
-- ─────────────────────────────────────────────
create table if not exists predictions (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references players(id) on delete cascade,
  match_id    text not null references matches(id) on delete cascade,
  winner      text not null,                -- 'home','away','draw'
  home_score  int,
  away_score  int,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (player_id, match_id)
);

alter table predictions enable row level security;
create policy "predictions_select" on predictions for select using (true);

-- Allow insert/update only when the match hasn't kicked off yet
create policy "predictions_insert_before_kickoff" on predictions
  for insert with check (
    exists (
      select 1 from matches m
      where m.id = match_id
        and (m.kickoff_utc is null or m.kickoff_utc > now())
    )
  );

create policy "predictions_update_before_kickoff" on predictions
  for update using (
    exists (
      select 1 from matches m
      where m.id = match_id
        and (m.kickoff_utc is null or m.kickoff_utc > now())
    )
  );

-- Auto-update updated_at on predictions
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger predictions_updated_at
  before update on predictions
  for each row execute function touch_updated_at();

-- ─────────────────────────────────────────────
--  leaderboard view  (used as a single round-trip RPC)
-- ─────────────────────────────────────────────
create or replace view leaderboard_view as
select
  p.id,
  p.name,
  p.dept,
  p.country,
  p.flag,
  p.initials,
  coalesce(sum(
    case when m.status = 'completed' then
      (case when pr.winner = (
        case
          when m.home_score > m.away_score then 'home'
          when m.home_score < m.away_score then 'away'
          else 'draw'
        end
      ) then 1 else 0 end)
      +
      (case when pr.home_score = m.home_score and pr.away_score = m.away_score then 2 else 0 end)
    else 0 end
  ), 0) as pts,
  coalesce(sum(
    case when m.status = 'completed'
      and pr.winner = (
        case
          when m.home_score > m.away_score then 'home'
          when m.home_score < m.away_score then 'away'
          else 'draw'
        end
      ) then 1 else 0 end
  ), 0) as correct,
  count(pr.id) filter (where m.status = 'completed') as graded,
  case
    when count(pr.id) filter (where m.status = 'completed') > 0
    then round(
      100.0 * sum(case when m.status = 'completed'
        and pr.winner = (
          case
            when m.home_score > m.away_score then 'home'
            when m.home_score < m.away_score then 'away'
            else 'draw'
          end
        ) then 1 else 0 end) /
      count(pr.id) filter (where m.status = 'completed')
    )
    else 0
  end as acc
from players p
left join predictions pr on pr.player_id = p.id
left join matches m on m.id = pr.match_id
group by p.id, p.name, p.dept, p.country, p.flag, p.initials
order by pts desc, correct desc, p.name;
