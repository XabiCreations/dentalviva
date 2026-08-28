--
-- PostgreSQL database dump
--

\restrict QbrICjjpShDqe0F71mKaN68EHDeLAcrWXwaMQqWCfxjxsBfaoqGgPgFli2fJZLM

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: admin_delete_patient(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_delete_patient(p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_id;
  DELETE FROM profiles WHERE id = p_id;
END;$$;


--
-- Name: admin_delete_patient(uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_delete_patient(p_id uuid, p_delete_newsletter boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE citas SET user_id = NULL WHERE user_id = p_id;
  IF p_delete_newsletter THEN
    DELETE FROM newsletter_subscribers WHERE user_id = p_id;
  END IF;
  DELETE FROM profiles WHERE id = p_id;
  DELETE FROM auth.users WHERE id = p_id;
END;
$$;


--
-- Name: admin_update_patient(uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_update_patient(p_id uuid, p_full_name text, p_last_name text, p_dni text, p_phone text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles SET
    full_name = p_full_name, last_name = NULLIF(p_last_name,''),
    dni = UPPER(p_dni), phone = NULLIF(p_phone,''), updated_at = now()
  WHERE id = p_id;
END;$$;


--
-- Name: admin_update_patient(uuid, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_update_patient(p_id uuid, p_full_name text, p_last_name text, p_dni text, p_email text, p_phone text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO profiles (id, full_name, last_name, dni, email, phone)
  VALUES (p_id, p_full_name, NULLIF(p_last_name,''), UPPER(p_dni), p_email, NULLIF(p_phone,''))
  ON CONFLICT (id) DO UPDATE SET
    full_name  = EXCLUDED.full_name,
    last_name  = EXCLUDED.last_name,
    dni        = EXCLUDED.dni,
    email      = EXCLUDED.email,
    phone      = EXCLUDED.phone,
    updated_at = now();

  UPDATE newsletter_subscribers
  SET email = p_email,
      name  = p_full_name
  WHERE user_id = p_id;
END;$$;


--
-- Name: cleanup_ghost_account(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_ghost_account(p_email text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
DECLARE
  v_user_id uuid;
  v_has_profile boolean;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = lower(trim(p_email));

  IF v_user_id IS NULL THEN
    RETURN 'available';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = v_user_id
  ) INTO v_has_profile;

  IF v_has_profile THEN
    RETURN 'has_account';
  END IF;

  -- Sin perfil = cuenta fantasma → eliminar para poder registrarse
  DELETE FROM auth.users WHERE id = v_user_id;
  RETURN 'ghost_cleaned';
END;
$$;


--
-- Name: current_dentist_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_dentist_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id FROM public.dentists WHERE user_id = auth.uid() LIMIT 1
$$;


--
-- Name: get_all_patients(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_patients() RETURNS TABLE(id uuid, full_name text, last_name text, dni text, email text, phone text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.last_name, p.dni, p.email, p.phone, p.created_at
  FROM profiles p ORDER BY p.created_at DESC;
END;$$;


--
-- Name: get_email_by_dni(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_email_by_dni(p_dni text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM profiles
  WHERE dni = upper(p_dni);
  RETURN v_email;
END;
$$;


--
-- Name: handle_dentists_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_dentists_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: is_email_subscribed(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_email_subscribed(p_email text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM newsletter_subscribers
    WHERE email = lower(trim(p_email))
    AND status = 'active'
  );
END;
$$;


--
-- Name: link_newsletter_subscription(text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.link_newsletter_subscription(p_email text, p_user_id uuid, p_full_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE newsletter_subscribers
  SET user_id = p_user_id,
      name    = p_full_name
  WHERE email = lower(trim(p_email));
END;
$$;


--
-- Name: subscribe_newsletter(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.subscribe_newsletter(p_name text, p_email text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO newsletter_subscribers (name, email, status)
  VALUES (trim(p_name), lower(trim(p_email)), 'active')
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    status = 'active';

  -- Vincula con perfil existente si el email coincide
  UPDATE newsletter_subscribers
  SET user_id = p.id
  FROM profiles p
  WHERE p.email = lower(trim(p_email))
    AND newsletter_subscribers.email = lower(trim(p_email))
    AND newsletter_subscribers.user_id IS NULL;
END;
$$;


--
-- Name: sync_cita_patient_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_cita_patient_fields() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: update_user_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_email(p_new_email text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE auth.users
  SET email             = p_new_email,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at         = NOW()
  WHERE id = auth.uid();

  UPDATE public.profiles
  SET email = p_new_email
  WHERE id = auth.uid();
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: citas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.citas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    tratamiento text,
    fecha date NOT NULL,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    patient_name text,
    hora text NOT NULL,
    dentist_id uuid,
    duration_min integer DEFAULT 30 NOT NULL,
    patient_phone text,
    patient_email text,
    CONSTRAINT citas_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'confirmada'::text, 'completada'::text, 'cancelada'::text, 'no_asistio'::text])))
);


--
-- Name: dentists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dentists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    specialty text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    email text,
    avatar_url text
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    user_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    dni text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone text NOT NULL,
    last_name text NOT NULL
);


--
-- Name: citas citas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_pkey PRIMARY KEY (id);


--
-- Name: dentists dentists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dentists
    ADD CONSTRAINT dentists_pkey PRIMARY KEY (id);


--
-- Name: dentists dentists_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dentists
    ADD CONSTRAINT dentists_user_id_key UNIQUE (user_id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_dni_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_dni_key UNIQUE (dni);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_email_idx ON public.newsletter_subscribers USING btree (email);


--
-- Name: newsletter_subscribers_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_user_id_idx ON public.newsletter_subscribers USING btree (user_id);


--
-- Name: citas citas_sync_patient_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER citas_sync_patient_fields BEFORE INSERT OR UPDATE OF user_id ON public.citas FOR EACH ROW EXECUTE FUNCTION public.sync_cita_patient_fields();


--
-- Name: dentists dentists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dentists_updated_at BEFORE UPDATE ON public.dentists FOR EACH ROW EXECUTE FUNCTION public.handle_dentists_updated_at();


--
-- Name: profiles profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: citas citas_dentist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_dentist_id_fkey FOREIGN KEY (dentist_id) REFERENCES public.dentists(id);


--
-- Name: citas citas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: dentists dentists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dentists
    ADD CONSTRAINT dentists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: newsletter_subscribers newsletter_subscribers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: dentists Anyone can view dentists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view dentists" ON public.dentists FOR SELECT USING (true);


--
-- Name: citas Dentists can insert citas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dentists can insert citas" ON public.citas FOR INSERT WITH CHECK ((dentist_id = public.current_dentist_id()));


--
-- Name: citas Dentists can update assigned citas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dentists can update assigned citas" ON public.citas FOR UPDATE USING ((dentist_id = public.current_dentist_id())) WITH CHECK ((dentist_id = public.current_dentist_id()));


--
-- Name: profiles Dentists can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dentists can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.dentists
  WHERE (dentists.user_id = auth.uid()))));


--
-- Name: citas Dentists can view assigned citas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dentists can view assigned citas" ON public.citas FOR SELECT USING ((dentist_id = public.current_dentist_id()));


--
-- Name: dentists Dentists can view own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dentists can view own record" ON public.dentists FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: citas Users can insert own citas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own citas" ON public.citas FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: citas Users can update own citas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own citas" ON public.citas FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: citas Users can view own citas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own citas" ON public.citas FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: citas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

--
-- Name: dentists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_insert ON public.newsletter_subscribers FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: newsletter_subscribers public_update_link; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_update_link ON public.newsletter_subscribers FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);


--
-- Name: newsletter_subscribers user_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_select_own ON public.newsletter_subscribers FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- PostgreSQL database dump complete
--

\unrestrict QbrICjjpShDqe0F71mKaN68EHDeLAcrWXwaMQqWCfxjxsBfaoqGgPgFli2fJZLM

