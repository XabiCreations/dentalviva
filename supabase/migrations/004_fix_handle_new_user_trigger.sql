-- Fix: handle_new_user ahora incluye last_name para evitar violación NOT NULL
-- El trigger leía full_name, dni, phone del metadata pero omitía last_name.
-- Si last_name tiene constraint NOT NULL, el INSERT fallaba en silencio.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, last_name, dni, email, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'dni', ''),
    new.email,
    NULLIF(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$;
