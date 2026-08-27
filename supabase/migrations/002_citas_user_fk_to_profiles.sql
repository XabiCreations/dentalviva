-- Cambia el FK de citas.user_id para apuntar a profiles(id) en vez de auth.users(id)
-- Esto permite que Supabase PostgREST haga el embedded join .select('*, profiles(...)')
-- ON DELETE SET NULL conserva el historial de citas cuando se elimina un paciente

ALTER TABLE public.citas DROP CONSTRAINT citas_user_id_fkey;

ALTER TABLE public.citas
  ADD CONSTRAINT citas_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
