-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║     DentalViva — Restructuración de dentistas (Option B)            ║
-- ║     Ejecutar en: Supabase Dashboard → SQL Editor                    ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- PASO 1: Borrar todas las citas (el seed las recreará)
DELETE FROM public.citas;

-- PASO 2: Borrar los 3 dentistas del seed anterior
DELETE FROM public.dentists
WHERE id IN (
  'd1000000-0000-4000-8000-000000000001',
  'd2000000-0000-4000-8000-000000000002',
  'd3000000-0000-4000-8000-000000000003'
);

-- Verificación: deben quedar exactamente 3 dentistas con user_id = null
SELECT
  id,
  name,
  specialty,
  CASE WHEN user_id IS NULL THEN '⚠ sin cuenta' ELSE '✓ con cuenta' END AS auth
FROM public.dentists
ORDER BY name;
