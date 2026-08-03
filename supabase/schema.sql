-- DayFlow – Supabase PostgreSQL Schema
-- Safe to run repeatedly, and safe to run against a project that already has
-- tables named tasks/completions/categories from an earlier app: CREATE TABLE
-- IF NOT EXISTS alone would silently skip an existing table and leave it with
-- the wrong columns, so every column is reconciled explicitly below.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────
-- Tables (created if absent)
-- ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- ────────────────────────────────────────
-- Columns (added if absent)
-- ────────────────────────────────────────

-- Categories: user-defined task labels with a color
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS name       TEXT,
  ADD COLUMN IF NOT EXISTS color      TEXT        NOT NULL DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Tasks: recurring or one-time task definitions
--   schedule 'daily'  = Mon–Fri automatically
--   schedule 'custom' = specific weekdays in the weekdays array (0=Sun … 6=Sat)
--   schedule 'once'   = single date stored in once_date
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title       TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS schedule    TEXT,
  ADD COLUMN IF NOT EXISTS weekdays    SMALLINT[],
  ADD COLUMN IF NOT EXISTS start_date  DATE,
  ADD COLUMN IF NOT EXISTS end_date    DATE,
  ADD COLUMN IF NOT EXISTS once_date   DATE,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "order"     INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived    BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Completions: one row per (task × date) when a user checks off a task
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS task_id        UUID REFERENCES tasks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS completed_date DATE,
  ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ────────────────────────────────────────
-- Constraints
-- ────────────────────────────────────────

-- One completion per task per day
DO $$ BEGIN
  ALTER TABLE completions ADD CONSTRAINT completions_task_date_key
    UNIQUE (task_id, completed_date);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- Restrict schedule to the three supported values
DO $$ BEGIN
  ALTER TABLE tasks ADD CONSTRAINT tasks_schedule_check
    CHECK (schedule IN ('daily', 'custom', 'once'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
ALTER TABLE tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Dropped first so re-running the script never fails on an existing policy
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;
DROP POLICY IF EXISTS "categories_delete" ON categories;

CREATE POLICY "categories_select" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_select" ON completions;
DROP POLICY IF EXISTS "completions_insert" ON completions;
DROP POLICY IF EXISTS "completions_delete" ON completions;

CREATE POLICY "completions_select" ON completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completions_insert" ON completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_delete" ON completions FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────
-- Refresh PostgREST's schema cache so the new columns are visible immediately
-- ────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
