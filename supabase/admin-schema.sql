-- ============================================================
-- DentalViva — Admin Schema  (idempotente, se puede re-ejecutar)
-- Compatible con el schema original (dentists con nombre/especialidad)
-- ============================================================

-- ─── 1. Migrar tabla dentists ────────────────────────────────

-- nombre → name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='dentists' AND column_name='nombre') THEN
    ALTER TABLE public.dentists RENAME COLUMN nombre TO name;
  END IF;
END $$;

-- especialidad → specialty
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='dentists' AND column_name='especialidad') THEN
    ALTER TABLE public.dentists RENAME COLUMN especialidad TO specialty;
  END IF;
END $$;

-- Columnas nuevas (todas opcionales para no romper filas existentes)
ALTER TABLE public.dentists
  ADD COLUMN IF NOT EXISTS user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email      TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dentists can view own record" ON public.dentists;
CREATE POLICY "Dentists can view own record"
  ON public.dentists FOR SELECT
  USING (auth.uid() = user_id);

-- ─── 2. Extender tabla citas ─────────────────────────────────

-- dentist_id: añadir si no existe
ALTER TABLE public.citas
  ADD COLUMN IF NOT EXISTS dentist_id UUID;

-- FK dentist_id → dentists (drop + recrear para ser idempotente)
ALTER TABLE public.citas DROP CONSTRAINT IF EXISTS citas_dentist_id_fkey;
ALTER TABLE public.citas
  ADD CONSTRAINT citas_dentist_id_fkey
  FOREIGN KEY (dentist_id) REFERENCES public.dentists(id);

-- Hacer user_id nullable si no lo es ya
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='citas'
      AND column_name='user_id' AND is_nullable='NO'
  ) THEN
    ALTER TABLE public.citas ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Nuevas columnas
ALTER TABLE public.citas
  ADD COLUMN IF NOT EXISTS duration_min       INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS source             TEXT    NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS notes              TEXT,
  ADD COLUMN IF NOT EXISTS patient_phone      TEXT,
  ADD COLUMN IF NOT EXISTS patient_email      TEXT,
  ADD COLUMN IF NOT EXISTS patient_birth_date DATE;

-- Actualizar constraint de estado (drop todos los existentes sobre estado, luego recrear)
DO $$
DECLARE
  cname TEXT;
BEGIN
  FOR cname IN
    SELECT cc.constraint_name
      FROM information_schema.check_constraints cc
      JOIN information_schema.constraint_column_usage ccu
        ON cc.constraint_name = ccu.constraint_name
     WHERE ccu.table_name   = 'citas'
       AND ccu.column_name  = 'estado'
       AND ccu.table_schema = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.citas DROP CONSTRAINT IF EXISTS %I', cname);
  END LOOP;
END $$;

ALTER TABLE public.citas
  ADD CONSTRAINT citas_estado_check
  CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio'));

-- ─── 3. Función helper ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_dentist_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.dentists WHERE user_id = auth.uid() LIMIT 1
$$;

-- ─── 4. Políticas RLS en citas para dentistas ─────────────────
DROP POLICY IF EXISTS "Dentists can view assigned citas"   ON public.citas;
DROP POLICY IF EXISTS "Dentists can insert citas"          ON public.citas;
DROP POLICY IF EXISTS "Dentists can update assigned citas" ON public.citas;

CREATE POLICY "Dentists can view assigned citas"
  ON public.citas FOR SELECT
  USING (dentist_id = public.current_dentist_id());

CREATE POLICY "Dentists can insert citas"
  ON public.citas FOR INSERT
  WITH CHECK (dentist_id = public.current_dentist_id());

CREATE POLICY "Dentists can update assigned citas"
  ON public.citas FOR UPDATE
  USING  (dentist_id = public.current_dentist_id())
  WITH CHECK (dentist_id = public.current_dentist_id());
