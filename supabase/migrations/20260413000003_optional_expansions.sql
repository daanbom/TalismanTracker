-- ============================================================
-- Phase 6 — Optional expansions toggle on games
-- ============================================================
-- The Dragon and Harbinger expansions are played only sometimes
-- (the rest are always on). Track which optional expansions were
-- in play for each game so stats can split "normal" vs variants.
--
-- Expected values in the array: 'dragon', 'harbinger'.

alter table games
  add column optional_expansions text[] not null default '{}';
