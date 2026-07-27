-- ============================================================
-- Migration 001 — Dentists table + citas updates
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Dentists table
CREATE TABLE IF NOT EXISTS public.dentists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  especialidad TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_dentists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dentists_updated_at
  BEFORE UPDATE ON public.dentists
  FOR EACH ROW EXECUTE FUNCTION public.handle_dentists_updated_at();

-- RLS — lectura pública (no contienen datos sensibles)
ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dentists"
  ON public.dentists FOR SELECT USING (true);

-- 2. Seed dentists
INSERT INTO public.dentists (nombre, especialidad) VALUES
  ('Dr. Carlos Mendoza', 'Implantología'),
  ('Dra. Ana García',    'Ortodoncia'),
  ('Dr. Luis Torres',    'Estética Dental')
ON CONFLICT DO NOTHING;

-- 3. Add dentist_id to citas
ALTER TABLE public.citas
  ADD COLUMN IF NOT EXISTS dentist_id UUID REFERENCES public.dentists(id);

-- 4. Expand estado CHECK to include 'realizada'
ALTER TABLE public.citas DROP CONSTRAINT IF EXISTS citas_estado_check;
ALTER TABLE public.citas ADD CONSTRAINT citas_estado_check
  CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'realizada'));

-- 5. RLS UPDATE policy so users can cancel their own citas
CREATE POLICY "Users can update own citas"
  ON public.citas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
