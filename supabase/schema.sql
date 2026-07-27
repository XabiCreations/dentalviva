-- ============================================================
-- DentalViva — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  birth_date  DATE NOT NULL,
  dni         TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — each user can only read/update their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT is allowed during sign-up (service role inserts via the API)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Citas table
-- To remove existing prueba records from a live DB, run first:
--   DELETE FROM public.citas WHERE tipo = 'prueba';
CREATE TABLE IF NOT EXISTS public.citas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL CHECK (tipo IN ('cita')),
  tratamiento  TEXT,
  fecha        DATE NOT NULL,
  hora         TEXT NOT NULL,
  patient_name TEXT,
  estado       TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own citas"
  ON public.citas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own citas"
  ON public.citas FOR INSERT
  WITH CHECK (auth.uid() = user_id);
