-- DayFlow – Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor

-- ────────────────────────────────────────
-- Extensions
-- ────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────
-- Tables
-- ────────────────────────────────────────

-- Categories: user-defined task labels with a color
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks: recurring or one-time task definitions
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  description  TEXT,
  -- 'daily'  = Mon–Fri automatically
  -- 'custom' = specific weekdays in the weekdays array (0=Sun … 6=Sat)
  -- 'once'   = single date stored in once_date
  schedule     TEXT        NOT NULL CHECK (schedule IN ('daily', 'custom', 'once')),
  weekdays     SMALLINT[]  DEFAULT NULL,   -- used when schedule = 'custom'
  start_date   DATE        NOT NULL,
  end_date     DATE        DEFAULT NULL,   -- NULL = no end
  once_date    DATE        DEFAULT NULL,   -- used when schedule = 'once'
  category_id  UUID        REFERENCES categories(id) ON DELETE SET NULL,
  "order"      INTEGER     NOT NULL DEFAULT 0,
  archived     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Completions: one row per (task × date) when a user checks off a task
CREATE TABLE IF NOT EXISTS completions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id         UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_date  DATE        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, completed_date)
);

-- ────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_categories_user     ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user          ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_archived ON tasks(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_completions_user    ON completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_date    ON completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_completions_task    ON completions(task_id, completed_date);

-- ────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions  ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "categories_select" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Completions policies
CREATE POLICY "completions_select" ON completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completions_insert" ON completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_delete" ON completions FOR DELETE USING (auth.uid() = user_id);
