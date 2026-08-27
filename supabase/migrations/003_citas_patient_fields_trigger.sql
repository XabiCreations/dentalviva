-- ============================================================
-- Trigger: auto-rellena patient_name, patient_phone, patient_email
-- en citas desde la tabla profiles al insertar o actualizar.
-- ============================================================

-- 1. Función del trigger
CREATE OR REPLACE FUNCTION public.sync_cita_patient_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_full_name text;
  v_last_name text;
  v_phone     text;
  v_email     text;
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    SELECT full_name, last_name, phone, email
      INTO v_full_name, v_last_name, v_phone, v_email
      FROM public.profiles
     WHERE id = NEW.user_id;

    NEW.patient_name  := CASE
                           WHEN v_last_name IS NOT NULL AND v_last_name <> ''
                           THEN v_full_name || ' ' || v_last_name
                           ELSE v_full_name
                         END;
    NEW.patient_phone := v_phone;
    NEW.patient_email := v_email;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Trigger en INSERT y UPDATE
DROP TRIGGER IF EXISTS citas_sync_patient_fields ON public.citas;

CREATE TRIGGER citas_sync_patient_fields
  BEFORE INSERT OR UPDATE OF user_id
  ON public.citas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_cita_patient_fields();

-- 3. Poblar citas existentes (ejecución única)
UPDATE public.citas c
SET
  patient_name  = CASE
                    WHEN p.last_name IS NOT NULL AND p.last_name <> ''
                    THEN p.full_name || ' ' || p.last_name
                    ELSE p.full_name
                  END,
  patient_phone = p.phone,
  patient_email = p.email
FROM public.profiles p
WHERE c.user_id = p.id
  AND (c.patient_name IS NULL OR c.patient_phone IS NULL OR c.patient_email IS NULL);
