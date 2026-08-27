-- ============================================================
-- DentalViva — Seed data
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Contraseña de todos los pacientes: Dentaviva2024!
-- 50 usuarios · 30 newsletter (todos active) · 100 citas
-- ============================================================

DO $$
DECLARE
  pwd text;
  iid uuid := '00000000-0000-0000-0000-000000000000';

  -- Dentistas (por nombre)
  mendoza_id uuid;  -- Implantes dentales
  garcia_id  uuid;  -- Blanqueamiento dental
  torres_id  uuid;  -- Estética dental

  -- 50 UUIDs fijos (idempotentes entre ejecuciones)
  u01 uuid := 'd0000000-0000-0000-0000-000000000001';
  u02 uuid := 'd0000000-0000-0000-0000-000000000002';
  u03 uuid := 'd0000000-0000-0000-0000-000000000003';
  u04 uuid := 'd0000000-0000-0000-0000-000000000004';
  u05 uuid := 'd0000000-0000-0000-0000-000000000005';
  u06 uuid := 'd0000000-0000-0000-0000-000000000006';
  u07 uuid := 'd0000000-0000-0000-0000-000000000007';
  u08 uuid := 'd0000000-0000-0000-0000-000000000008';
  u09 uuid := 'd0000000-0000-0000-0000-000000000009';
  u10 uuid := 'd0000000-0000-0000-0000-000000000010';
  u11 uuid := 'd0000000-0000-0000-0000-000000000011';
  u12 uuid := 'd0000000-0000-0000-0000-000000000012';
  u13 uuid := 'd0000000-0000-0000-0000-000000000013';
  u14 uuid := 'd0000000-0000-0000-0000-000000000014';
  u15 uuid := 'd0000000-0000-0000-0000-000000000015';
  u16 uuid := 'd0000000-0000-0000-0000-000000000016';
  u17 uuid := 'd0000000-0000-0000-0000-000000000017';
  u18 uuid := 'd0000000-0000-0000-0000-000000000018';
  u19 uuid := 'd0000000-0000-0000-0000-000000000019';
  u20 uuid := 'd0000000-0000-0000-0000-000000000020';
  u21 uuid := 'd0000000-0000-0000-0000-000000000021';
  u22 uuid := 'd0000000-0000-0000-0000-000000000022';
  u23 uuid := 'd0000000-0000-0000-0000-000000000023';
  u24 uuid := 'd0000000-0000-0000-0000-000000000024';
  u25 uuid := 'd0000000-0000-0000-0000-000000000025';
  u26 uuid := 'd0000000-0000-0000-0000-000000000026';
  u27 uuid := 'd0000000-0000-0000-0000-000000000027';
  u28 uuid := 'd0000000-0000-0000-0000-000000000028';
  u29 uuid := 'd0000000-0000-0000-0000-000000000029';
  u30 uuid := 'd0000000-0000-0000-0000-000000000030';
  u31 uuid := 'd0000000-0000-0000-0000-000000000031';
  u32 uuid := 'd0000000-0000-0000-0000-000000000032';
  u33 uuid := 'd0000000-0000-0000-0000-000000000033';
  u34 uuid := 'd0000000-0000-0000-0000-000000000034';
  u35 uuid := 'd0000000-0000-0000-0000-000000000035';
  u36 uuid := 'd0000000-0000-0000-0000-000000000036';
  u37 uuid := 'd0000000-0000-0000-0000-000000000037';
  u38 uuid := 'd0000000-0000-0000-0000-000000000038';
  u39 uuid := 'd0000000-0000-0000-0000-000000000039';
  u40 uuid := 'd0000000-0000-0000-0000-000000000040';
  u41 uuid := 'd0000000-0000-0000-0000-000000000041';
  u42 uuid := 'd0000000-0000-0000-0000-000000000042';
  u43 uuid := 'd0000000-0000-0000-0000-000000000043';
  u44 uuid := 'd0000000-0000-0000-0000-000000000044';
  u45 uuid := 'd0000000-0000-0000-0000-000000000045';
  u46 uuid := 'd0000000-0000-0000-0000-000000000046';
  u47 uuid := 'd0000000-0000-0000-0000-000000000047';
  u48 uuid := 'd0000000-0000-0000-0000-000000000048';
  u49 uuid := 'd0000000-0000-0000-0000-000000000049';
  u50 uuid := 'd0000000-0000-0000-0000-000000000050';

BEGIN
  -- ── Limpieza idempotente ───────────────────────────────────
  DELETE FROM public.citas
    WHERE user_id::text LIKE 'd0000000-0000-0000-0000-%';
  DELETE FROM public.newsletter_subscribers
    WHERE user_id::text LIKE 'd0000000-0000-0000-0000-%'
       OR email LIKE '%.seed@%';
  DELETE FROM public.profiles
    WHERE id::text LIKE 'd0000000-0000-0000-0000-%';
  DELETE FROM auth.users
    WHERE id::text LIKE 'd0000000-0000-0000-0000-%';

  -- ── Dentistas ─────────────────────────────────────────────
  SELECT id INTO mendoza_id FROM public.dentists WHERE name ILIKE '%mendoza%' LIMIT 1;
  SELECT id INTO garcia_id  FROM public.dentists WHERE name ILIKE '%garc%'    LIMIT 1;
  SELECT id INTO torres_id  FROM public.dentists WHERE name ILIKE '%torres%'  LIMIT 1;

  -- Fallback por orden de creación si los nombres no coinciden
  IF mendoza_id IS NULL THEN SELECT id INTO mendoza_id FROM public.dentists ORDER BY created_at LIMIT 1 OFFSET 0; END IF;
  IF garcia_id  IS NULL THEN SELECT id INTO garcia_id  FROM public.dentists ORDER BY created_at LIMIT 1 OFFSET 1; END IF;
  IF torres_id  IS NULL THEN SELECT id INTO torres_id  FROM public.dentists ORDER BY created_at LIMIT 1 OFFSET 2; END IF;

  IF mendoza_id IS NULL THEN RAISE EXCEPTION 'Se necesitan al menos 3 dentistas en la tabla dentists.'; END IF;
  IF garcia_id  IS NULL THEN garcia_id  := mendoza_id; END IF;
  IF torres_id  IS NULL THEN torres_id  := mendoza_id; END IF;

  pwd := crypt('Dentaviva2024!', gen_salt('bf'));

  -- ══════════════════════════════════════════════════════════
  -- AUTH USERS (50)
  -- u03,u08,u12,u18,u23,u28,u33,u38,u43,u47 → email ficticio
  -- ══════════════════════════════════════════════════════════
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_super_admin,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    (u01,iid,'authenticated','authenticated','maria.garcia01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u02,iid,'authenticated','authenticated','carlos.rodriguez01@hotmail.com',    pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u03,iid,'authenticated','authenticated','10000003c@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u04,iid,'authenticated','authenticated','jorge.sanchez01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u05,iid,'authenticated','authenticated','laura.fernandez01@gmail.com',       pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u06,iid,'authenticated','authenticated','pablo.lopez01@outlook.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u07,iid,'authenticated','authenticated','sofia.jimenez01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u08,iid,'authenticated','authenticated','10000008h@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u09,iid,'authenticated','authenticated','cristina.moreno01@yahoo.es',        pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u10,iid,'authenticated','authenticated','daniel.torres01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u11,iid,'authenticated','authenticated','elena.ramirez01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u12,iid,'authenticated','authenticated','10000012m@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u13,iid,'authenticated','authenticated','natalia.herrera01@gmail.com',       pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u14,iid,'authenticated','authenticated','miguel.nunez01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u15,iid,'authenticated','authenticated','carmen.castillo01@gmail.com',       pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u16,iid,'authenticated','authenticated','fernando.ortega01@gmail.com',       pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u17,iid,'authenticated','authenticated','patricia.morales01@outlook.com',    pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u18,iid,'authenticated','authenticated','10000018t@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u19,iid,'authenticated','authenticated','isabel.serrano01@gmail.com',        pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u20,iid,'authenticated','authenticated','marcos.rubio01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u21,iid,'authenticated','authenticated','lucia.navarro01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u22,iid,'authenticated','authenticated','javier.romero01@hotmail.com',       pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u23,iid,'authenticated','authenticated','10000023z@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u24,iid,'authenticated','authenticated','oscar.flores01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u25,iid,'authenticated','authenticated','marta.blanco01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u26,iid,'authenticated','authenticated','ruben.molina01@outlook.com',        pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u27,iid,'authenticated','authenticated','paula.ramos01@gmail.com',           pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u28,iid,'authenticated','authenticated','10000028e@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u29,iid,'authenticated','authenticated','nuria.gonzalez01@gmail.com',        pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u30,iid,'authenticated','authenticated','alberto.perez01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u31,iid,'authenticated','authenticated','sandra.campos01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u32,iid,'authenticated','authenticated','sergio.herrero01@hotmail.com',      pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u33,iid,'authenticated','authenticated','10000033k@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u34,iid,'authenticated','authenticated','rafael.lara01@gmail.com',           pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u35,iid,'authenticated','authenticated','irene.santos01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u36,iid,'authenticated','authenticated','david.jimenez01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u37,iid,'authenticated','authenticated','beatriz.ortiz01@gmail.com',         pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u38,iid,'authenticated','authenticated','10000038q@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u39,iid,'authenticated','authenticated','julia.vargas01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u40,iid,'authenticated','authenticated','manuel.reyes01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u41,iid,'authenticated','authenticated','pilar.mora01@gmail.com',            pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u42,iid,'authenticated','authenticated','luis.hernandez01@hotmail.com',      pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u43,iid,'authenticated','authenticated','10000043w@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u44,iid,'authenticated','authenticated','pedro.romero01@gmail.com',          pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u45,iid,'authenticated','authenticated','eva.nunez01@gmail.com',             pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u46,iid,'authenticated','authenticated','juan.ruiz01@gmail.com',             pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u47,iid,'authenticated','authenticated','10000047a@patients.dentaviva.es',   pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u48,iid,'authenticated','authenticated','antonio.morales01@gmail.com',       pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u49,iid,'authenticated','authenticated','raquel.serrano01@gmail.com',        pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','',''),
    (u50,iid,'authenticated','authenticated','ramon.lopez01@gmail.com',           pwd,now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now(),false,'','','','')
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════════
  -- PROFILES (50) — todos con phone y last_name
  -- ══════════════════════════════════════════════════════════
  INSERT INTO public.profiles (id, full_name, last_name, dni, email, phone, created_at, updated_at) VALUES
    (u01,'María',    'García López',      '10000001A','maria.garcia01@gmail.com',       '612000001',now(),now()),
    (u02,'Carlos',   'Rodríguez Vega',    '10000002B','carlos.rodriguez01@hotmail.com', '612000002',now(),now()),
    (u03,'Ana',      'Martínez Ruiz',     '10000003C','10000003c@patients.dentaviva.es','612000003',now(),now()),
    (u04,'Jorge',    'Sánchez Gil',       '10000004D','jorge.sanchez01@gmail.com',      '612000004',now(),now()),
    (u05,'Laura',    'Fernández Castro',  '10000005E','laura.fernandez01@gmail.com',    '612000005',now(),now()),
    (u06,'Pablo',    'López Moreno',      '10000006F','pablo.lopez01@outlook.com',      '612000006',now(),now()),
    (u07,'Sofía',    'Jiménez Ruiz',      '10000007G','sofia.jimenez01@gmail.com',      '612000007',now(),now()),
    (u08,'Alejandro','Díaz Vega',         '10000008H','10000008h@patients.dentaviva.es','612000008',now(),now()),
    (u09,'Cristina', 'Moreno García',     '10000009J','cristina.moreno01@yahoo.es',     '612000009',now(),now()),
    (u10,'Daniel',   'Torres Cruz',       '10000010K','daniel.torres01@gmail.com',      '612000010',now(),now()),
    (u11,'Elena',    'Ramírez Flores',    '10000011L','elena.ramirez01@gmail.com',      '612000011',now(),now()),
    (u12,'Roberto',  'Vargas Díaz',       '10000012M','10000012m@patients.dentaviva.es','612000012',now(),now()),
    (u13,'Natalia',  'Herrera Soto',      '10000013N','natalia.herrera01@gmail.com',    '612000013',now(),now()),
    (u14,'Miguel',   'Núñez Pérez',       '10000014P','miguel.nunez01@gmail.com',       '612000014',now(),now()),
    (u15,'Carmen',   'Castillo Rojas',    '10000015Q','carmen.castillo01@gmail.com',    '612000015',now(),now()),
    (u16,'Fernando', 'Ortega Lara',       '10000016R','fernando.ortega01@gmail.com',    '612000016',now(),now()),
    (u17,'Patricia', 'Morales Vera',      '10000017S','patricia.morales01@outlook.com', '612000017',now(),now()),
    (u18,'Adrián',   'Gutiérrez Blanco',  '10000018T','10000018t@patients.dentaviva.es','612000018',now(),now()),
    (u19,'Isabel',   'Serrano Muñoz',     '10000019V','isabel.serrano01@gmail.com',     '612000019',now(),now()),
    (u20,'Marcos',   'Rubio Delgado',     '10000020W','marcos.rubio01@gmail.com',       '612000020',now(),now()),
    (u21,'Lucía',    'Navarro Campos',    '10000021X','lucia.navarro01@gmail.com',      '612000021',now(),now()),
    (u22,'Javier',   'Romero Alonso',     '10000022Y','javier.romero01@hotmail.com',    '612000022',now(),now()),
    (u23,'Sara',     'Medina Ramos',      '10000023Z','10000023z@patients.dentaviva.es','612000023',now(),now()),
    (u24,'Óscar',    'Flores Reyes',      '10000024A','oscar.flores01@gmail.com',       '612000024',now(),now()),
    (u25,'Marta',    'Blanco Santos',     '10000025B','marta.blanco01@gmail.com',       '612000025',now(),now()),
    (u26,'Rubén',    'Molina Lara',       '10000026C','ruben.molina01@outlook.com',     '612000026',now(),now()),
    (u27,'Paula',    'Ramos Herrero',     '10000027D','paula.ramos01@gmail.com',        '612000027',now(),now()),
    (u28,'Víctor',   'Alonso Cruz',       '10000028E','10000028e@patients.dentaviva.es','612000028',now(),now()),
    (u29,'Nuria',    'González Vega',     '10000029F','nuria.gonzalez01@gmail.com',     '612000029',now(),now()),
    (u30,'Alberto',  'Pérez Molina',      '10000030G','alberto.perez01@gmail.com',      '612000030',now(),now()),
    (u31,'Sandra',   'Campos Gil',        '10000031H','sandra.campos01@gmail.com',      '612000031',now(),now()),
    (u32,'Sergio',   'Herrero Díaz',      '10000032J','sergio.herrero01@hotmail.com',   '612000032',now(),now()),
    (u33,'Alicia',   'Delgado Mora',      '10000033K','10000033k@patients.dentaviva.es','612000033',now(),now()),
    (u34,'Rafael',   'Lara Ruiz',         '10000034L','rafael.lara01@gmail.com',        '612000034',now(),now()),
    (u35,'Irene',    'Santos Navarro',    '10000035M','irene.santos01@gmail.com',       '612000035',now(),now()),
    (u36,'David',    'Jiménez Flores',    '10000036N','david.jimenez01@gmail.com',      '612000036',now(),now()),
    (u37,'Beatriz',  'Ortiz Hernández',   '10000037P','beatriz.ortiz01@gmail.com',      '612000037',now(),now()),
    (u38,'Tomás',    'Castro Romero',     '10000038Q','10000038q@patients.dentaviva.es','612000038',now(),now()),
    (u39,'Julia',    'Vargas López',      '10000039R','julia.vargas01@gmail.com',       '612000039',now(),now()),
    (u40,'Manuel',   'Reyes Castillo',    '10000040S','manuel.reyes01@gmail.com',       '612000040',now(),now()),
    (u41,'Pilar',    'Mora Sánchez',      '10000041T','pilar.mora01@gmail.com',         '612000041',now(),now()),
    (u42,'Luis',     'Hernández Vega',    '10000042V','luis.hernandez01@hotmail.com',   '612000042',now(),now()),
    (u43,'Silvia',   'Cruz Moreno',       '10000043W','10000043w@patients.dentaviva.es','612000043',now(),now()),
    (u44,'Pedro',    'Romero García',     '10000044X','pedro.romero01@gmail.com',       '612000044',now(),now()),
    (u45,'Eva',      'Núñez Blanco',      '10000045Y','eva.nunez01@gmail.com',          '612000045',now(),now()),
    (u46,'Juan',     'Ruiz Pérez',        '10000046Z','juan.ruiz01@gmail.com',          '612000046',now(),now()),
    (u47,'Rosa',     'González Díaz',     '10000047A','10000047a@patients.dentaviva.es','612000047',now(),now()),
    (u48,'Antonio',  'Morales Ramos',     '10000048B','antonio.morales01@gmail.com',    '612000048',now(),now()),
    (u49,'Raquel',   'Serrano Gil',       '10000049C','raquel.serrano01@gmail.com',     '612000049',now(),now()),
    (u50,'Ramón',    'López Gutiérrez',   '10000050D','ramon.lopez01@gmail.com',        '612000050',now(),now())
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════════
  -- NEWSLETTER (30) — todos active
  -- 15 con cuenta de usuario · 15 sin cuenta
  -- ══════════════════════════════════════════════════════════
  INSERT INTO public.newsletter_subscribers (id, email, name, user_id, status, subscribed_at, created_at) VALUES
    -- Con cuenta
    (gen_random_uuid(),'maria.garcia01@gmail.com',       'María García',      u01,'active',now()-'120 days'::interval,now()),
    (gen_random_uuid(),'carlos.rodriguez01@hotmail.com', 'Carlos Rodríguez',  u02,'active',now()-'105 days'::interval,now()),
    (gen_random_uuid(),'laura.fernandez01@gmail.com',    'Laura Fernández',   u05,'active',now()-'90 days'::interval,now()),
    (gen_random_uuid(),'pablo.lopez01@outlook.com',      'Pablo López',       u06,'active',now()-'78 days'::interval,now()),
    (gen_random_uuid(),'sofia.jimenez01@gmail.com',      'Sofía Jiménez',     u07,'active',now()-'65 days'::interval,now()),
    (gen_random_uuid(),'cristina.moreno01@yahoo.es',     'Cristina Moreno',   u09,'active',now()-'55 days'::interval,now()),
    (gen_random_uuid(),'daniel.torres01@gmail.com',      'Daniel Torres',     u10,'active',now()-'48 days'::interval,now()),
    (gen_random_uuid(),'elena.ramirez01@gmail.com',      'Elena Ramírez',     u11,'active',now()-'40 days'::interval,now()),
    (gen_random_uuid(),'natalia.herrera01@gmail.com',    'Natalia Herrera',   u13,'active',now()-'33 days'::interval,now()),
    (gen_random_uuid(),'carmen.castillo01@gmail.com',    'Carmen Castillo',   u15,'active',now()-'28 days'::interval,now()),
    (gen_random_uuid(),'isabel.serrano01@gmail.com',     'Isabel Serrano',    u19,'active',now()-'20 days'::interval,now()),
    (gen_random_uuid(),'marcos.rubio01@gmail.com',       'Marcos Rubio',      u20,'active',now()-'15 days'::interval,now()),
    (gen_random_uuid(),'marta.blanco01@gmail.com',       'Marta Blanco',      u25,'active',now()-'10 days'::interval,now()),
    (gen_random_uuid(),'nuria.gonzalez01@gmail.com',     'Nuria González',    u29,'active',now()-'7 days'::interval,now()),
    (gen_random_uuid(),'irene.santos01@gmail.com',       'Irene Santos',      u35,'active',now()-'3 days'::interval,now()),
    -- Sin cuenta (email con .seed@ para limpieza idempotente)
    (gen_random_uuid(),'lucia.seed@gmail.com',           'Lucía Rivera',      NULL,'active',now()-'95 days'::interval,now()),
    (gen_random_uuid(),'pedro.seed@outlook.com',         'Pedro Alonso',      NULL,'active',now()-'82 days'::interval,now()),
    (gen_random_uuid(),'nuria.seed@hotmail.com',         'Nuria Vega',        NULL,'active',now()-'70 days'::interval,now()),
    (gen_random_uuid(),'raul.seed@gmail.com',            'Raúl Santos',       NULL,'active',now()-'60 days'::interval,now()),
    (gen_random_uuid(),'teresa.seed@gmail.com',          'Teresa Blanco',     NULL,'active',now()-'52 days'::interval,now()),
    (gen_random_uuid(),'hugo.seed@gmail.com',            'Hugo Martín',       NULL,'active',now()-'44 days'::interval,now()),
    (gen_random_uuid(),'valentina.seed@gmail.com',       'Valentina Ruiz',    NULL,'active',now()-'37 days'::interval,now()),
    (gen_random_uuid(),'marcos.seed@outlook.com',        'Marcos Delgado',    NULL,'active',now()-'29 days'::interval,now()),
    (gen_random_uuid(),'carolina.seed@gmail.com',        'Carolina Gil',      NULL,'active',now()-'22 days'::interval,now()),
    (gen_random_uuid(),'andres.seed@gmail.com',          'Andrés Moreno',     NULL,'active',now()-'16 days'::interval,now()),
    (gen_random_uuid(),'elenac.seed@hotmail.com',        'Elena Castillo',    NULL,'active',now()-'12 days'::interval,now()),
    (gen_random_uuid(),'ivan.seed@gmail.com',            'Iván Torres',       NULL,'active',now()-'9 days'::interval,now()),
    (gen_random_uuid(),'claudia.seed@gmail.com',         'Claudia Hernández', NULL,'active',now()-'6 days'::interval,now()),
    (gen_random_uuid(),'miguelv.seed@gmail.com',         'Miguel Vázquez',    NULL,'active',now()-'4 days'::interval,now()),
    (gen_random_uuid(),'sofiap.seed@gmail.com',          'Sofía Paredes',     NULL,'active',now()-'2 days'::interval,now())
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════════
  -- CITAS (100) — 34 Mendoza · 33 García · 33 Torres
  -- Preferentes: Mendoza=Implantes, García=Blanqueamiento, Torres=Estética
  -- Compartidos: Ortodoncia, Odontología general (cualquier dentista)
  -- ══════════════════════════════════════════════════════════
  INSERT INTO public.citas (dentist_id, user_id, tratamiento, fecha, hora, duration_min, estado, created_at) VALUES

    -- ══ DR. MENDOZA — 34 citas ══════════════════════════════
    -- completada (10)
    (mendoza_id,u01,'Implantes dentales',    '2026-01-15','10:00',90,'completada',now()),
    (mendoza_id,u02,'Ortodoncia',            '2026-01-28','11:30',45,'completada',now()),
    (mendoza_id,u04,'Extracción dental',     '2026-02-10','09:00',30,'completada',now()),
    (mendoza_id,u06,'Implantes dentales',    '2026-02-25','10:00',90,'completada',now()),
    (mendoza_id,u09,'Ortodoncia',            '2026-03-12','11:00',45,'completada',now()),
    (mendoza_id,u11,'Periodoncia',           '2026-04-08','09:30',45,'completada',now()),
    (mendoza_id,u14,'Implantes dentales',    '2026-04-22','10:00',90,'completada',now()),
    (mendoza_id,u16,'Extracción dental',     '2026-05-14','09:00',30,'completada',now()),
    (mendoza_id,u19,'Implantes dentales',    '2026-06-03','10:00',90,'completada',now()),
    (mendoza_id,u22,'Implantes dentales',    '2026-06-18','10:00',90,'completada',now()),
    -- confirmada (9)
    (mendoza_id,u25,'Implantes dentales',    '2026-08-28','10:00',90,'confirmada',now()),
    (mendoza_id,u26,'Ortodoncia',            '2026-09-02','11:00',45,'confirmada',now()),
    (mendoza_id,u27,'Implantes dentales',    '2026-09-10','10:00',90,'confirmada',now()),
    (mendoza_id,u29,'Periodoncia',           '2026-09-18','09:30',45,'confirmada',now()),
    (mendoza_id,u30,'Implantes dentales',    '2026-09-25','10:00',90,'confirmada',now()),
    (mendoza_id,u31,'Extracción dental',     '2026-10-02','09:00',30,'confirmada',now()),
    (mendoza_id,u34,'Ortodoncia',            '2026-10-09','11:30',45,'confirmada',now()),
    (mendoza_id,u35,'Implantes dentales',    '2026-10-16','10:00',90,'confirmada',now()),
    (mendoza_id,u36,'Periodoncia',           '2026-10-23','09:30',45,'confirmada',now()),
    -- pendiente (8)
    (mendoza_id,u37,'Implantes dentales',    '2026-11-03','10:00',90,'pendiente', now()),
    (mendoza_id,u39,'Extracción dental',     '2026-11-10','09:00',30,'pendiente', now()),
    (mendoza_id,u40,'Ortodoncia',            '2026-11-17','11:00',45,'pendiente', now()),
    (mendoza_id,u41,'Implantes dentales',    '2026-11-24','10:00',90,'pendiente', now()),
    (mendoza_id,u44,'Periodoncia',           '2026-12-01','09:30',45,'pendiente', now()),
    (mendoza_id,u45,'Ortodoncia',            '2026-12-08','11:30',45,'pendiente', now()),
    (mendoza_id,u46,'Implantes dentales',    '2026-12-15','10:00',90,'pendiente', now()),
    (mendoza_id,u48,'Extracción dental',     '2026-12-22','09:00',30,'pendiente', now()),
    -- cancelada (4)
    (mendoza_id,u05,'Implantes dentales',    '2026-03-05','10:00',90,'cancelada', now()),
    (mendoza_id,u10,'Ortodoncia',            '2026-05-20','11:00',45,'cancelada', now()),
    (mendoza_id,u24,'Implantes dentales',    '2026-07-08','10:00',90,'cancelada', now()),
    (mendoza_id,u49,'Extracción dental',     '2026-08-12','09:00',30,'cancelada', now()),
    -- no_asistio (3)
    (mendoza_id,u03,'Implantes dentales',    '2026-04-15','10:00',90,'no_asistio',now()),
    (mendoza_id,u17,'Ortodoncia',            '2026-06-30','11:00',45,'no_asistio',now()),
    (mendoza_id,u32,'Implantes dentales',    '2026-07-22','10:00',90,'no_asistio',now()),

    -- ══ DRA. GARCÍA — 33 citas ══════════════════════════════
    -- completada (10)
    (garcia_id, u07,'Blanqueamiento dental', '2026-01-20','11:00',60,'completada',now()),
    (garcia_id, u08,'Limpieza dental',       '2026-02-05','10:00',45,'completada',now()),
    (garcia_id, u09,'Blanqueamiento dental', '2026-02-19','11:00',60,'completada',now()),
    (garcia_id, u12,'Ortodoncia',            '2026-03-04','09:30',45,'completada',now()),
    (garcia_id, u13,'Revisión general',      '2026-03-18','16:00',30,'completada',now()),
    (garcia_id, u15,'Blanqueamiento dental', '2026-04-01','11:00',60,'completada',now()),
    (garcia_id, u18,'Limpieza dental',       '2026-05-06','10:00',45,'completada',now()),
    (garcia_id, u20,'Ortodoncia',            '2026-05-20','09:30',45,'completada',now()),
    (garcia_id, u23,'Blanqueamiento dental', '2026-06-09','11:00',60,'completada',now()),
    (garcia_id, u28,'Revisión general',      '2026-07-01','16:00',30,'completada',now()),
    -- confirmada (9)
    (garcia_id, u29,'Blanqueamiento dental', '2026-08-28','11:00',60,'confirmada',now()),
    (garcia_id, u30,'Limpieza dental',       '2026-09-04','10:00',45,'confirmada',now()),
    (garcia_id, u31,'Blanqueamiento dental', '2026-09-11','11:00',60,'confirmada',now()),
    (garcia_id, u33,'Ortodoncia',            '2026-09-18','09:30',45,'confirmada',now()),
    (garcia_id, u34,'Revisión general',      '2026-09-25','16:00',30,'confirmada',now()),
    (garcia_id, u35,'Blanqueamiento dental', '2026-10-02','11:00',60,'confirmada',now()),
    (garcia_id, u36,'Limpieza dental',       '2026-10-09','10:00',45,'confirmada',now()),
    (garcia_id, u38,'Ortodoncia',            '2026-10-16','09:30',45,'confirmada',now()),
    (garcia_id, u39,'Blanqueamiento dental', '2026-10-23','11:00',60,'confirmada',now()),
    -- pendiente (7)
    (garcia_id, u40,'Blanqueamiento dental', '2026-11-06','11:00',60,'pendiente', now()),
    (garcia_id, u41,'Revisión general',      '2026-11-13','16:00',30,'pendiente', now()),
    (garcia_id, u42,'Limpieza dental',       '2026-11-20','10:00',45,'pendiente', now()),
    (garcia_id, u43,'Ortodoncia',            '2026-11-27','09:30',45,'pendiente', now()),
    (garcia_id, u44,'Blanqueamiento dental', '2026-12-04','11:00',60,'pendiente', now()),
    (garcia_id, u47,'Revisión general',      '2026-12-11','16:00',30,'pendiente', now()),
    (garcia_id, u50,'Blanqueamiento dental', '2026-12-18','11:00',60,'pendiente', now()),
    -- cancelada (4)
    (garcia_id, u02,'Blanqueamiento dental', '2026-02-12','11:00',60,'cancelada', now()),
    (garcia_id, u11,'Limpieza dental',       '2026-04-23','10:00',45,'cancelada', now()),
    (garcia_id, u21,'Blanqueamiento dental', '2026-06-17','11:00',60,'cancelada', now()),
    (garcia_id, u45,'Ortodoncia',            '2026-08-05','09:30',45,'cancelada', now()),
    -- no_asistio (3)
    (garcia_id, u10,'Blanqueamiento dental', '2026-03-26','11:00',60,'no_asistio',now()),
    (garcia_id, u22,'Revisión general',      '2026-05-27','16:00',30,'no_asistio',now()),
    (garcia_id, u46,'Blanqueamiento dental', '2026-07-15','11:00',60,'no_asistio',now()),

    -- ══ DR. TORRES — 33 citas ═══════════════════════════════
    -- completada (10)
    (torres_id, u01,'Estética dental',       '2026-01-22','10:00',60,'completada',now()),
    (torres_id, u04,'Endodoncia',            '2026-02-05','11:30',90,'completada',now()),
    (torres_id, u06,'Estética dental',       '2026-02-19','10:00',60,'completada',now()),
    (torres_id, u14,'Odontología general',   '2026-03-05','09:00',30,'completada',now()),
    (torres_id, u16,'Estética dental',       '2026-03-19','10:00',60,'completada',now()),
    (torres_id, u19,'Ortodoncia',            '2026-04-02','11:00',45,'completada',now()),
    (torres_id, u20,'Endodoncia',            '2026-05-07','11:30',90,'completada',now()),
    (torres_id, u23,'Estética dental',       '2026-05-21','10:00',60,'completada',now()),
    (torres_id, u25,'Odontología general',   '2026-06-10','09:00',30,'completada',now()),
    (torres_id, u27,'Estética dental',       '2026-06-24','10:00',60,'completada',now()),
    -- confirmada (8)
    (torres_id, u28,'Estética dental',       '2026-08-28','10:00',60,'confirmada',now()),
    (torres_id, u32,'Endodoncia',            '2026-09-04','11:30',90,'confirmada',now()),
    (torres_id, u33,'Ortodoncia',            '2026-09-11','11:00',45,'confirmada',now()),
    (torres_id, u37,'Estética dental',       '2026-09-18','10:00',60,'confirmada',now()),
    (torres_id, u38,'Odontología general',   '2026-09-25','09:00',30,'confirmada',now()),
    (torres_id, u42,'Estética dental',       '2026-10-02','10:00',60,'confirmada',now()),
    (torres_id, u43,'Endodoncia',            '2026-10-09','11:30',90,'confirmada',now()),
    (torres_id, u48,'Ortodoncia',            '2026-10-16','11:00',45,'confirmada',now()),
    -- pendiente (8)
    (torres_id, u49,'Estética dental',       '2026-11-05','10:00',60,'pendiente', now()),
    (torres_id, u50,'Ortodoncia',            '2026-11-12','11:00',45,'pendiente', now()),
    (torres_id, u01,'Endodoncia',            '2026-11-19','11:30',90,'pendiente', now()),
    (torres_id, u02,'Estética dental',       '2026-11-26','10:00',60,'pendiente', now()),
    (torres_id, u03,'Odontología general',   '2026-12-03','09:00',30,'pendiente', now()),
    (torres_id, u05,'Estética dental',       '2026-12-10','10:00',60,'pendiente', now()),
    (torres_id, u07,'Ortodoncia',            '2026-12-17','11:00',45,'pendiente', now()),
    (torres_id, u08,'Endodoncia',            '2026-12-24','11:30',90,'pendiente', now()),
    -- cancelada (4)
    (torres_id, u15,'Estética dental',       '2026-02-26','10:00',60,'cancelada', now()),
    (torres_id, u18,'Endodoncia',            '2026-04-14','11:30',90,'cancelada', now()),
    (torres_id, u26,'Estética dental',       '2026-06-25','10:00',60,'cancelada', now()),
    (torres_id, u47,'Ortodoncia',            '2026-08-13','11:00',45,'cancelada', now()),
    -- no_asistio (3)
    (torres_id, u13,'Estética dental',       '2026-03-26','10:00',60,'no_asistio',now()),
    (torres_id, u17,'Odontología general',   '2026-05-14','09:00',30,'no_asistio',now()),
    (torres_id, u24,'Estética dental',       '2026-07-23','10:00',60,'no_asistio',now());

END $$;
