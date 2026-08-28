# DentalViva

Landing page y sistema de gestión de citas para clínica dental. Incluye panel de administración para dentistas y reserva de citas online para pacientes.

## Stack

- **Frontend** — React 18 + TypeScript + Tailwind CSS + GSAP
- **Backend** — Supabase (PostgreSQL, Auth, RLS, RPCs)
- **Build** — Vite

---

## Instalación desde cero

### 1. Clonar el repositorio

```bash
git clone https://github.com/XabiCreations/dentalviva.git
cd dentalviva
npm install
```

### 2. Crear un proyecto en Supabase

Ve a [supabase.com](https://supabase.com), crea un proyecto nuevo y anota la **URL** y la **anon key** (en *Project Settings → API*).

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```
VITE_SUPABASE_URL=https://tu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Inicializar la base de datos

En el **SQL Editor** de tu proyecto Supabase, ejecuta los dos archivos en este orden:

**Paso 1 — Schema** (tablas, funciones, triggers, políticas RLS):
```
supabase/setup.sql
```

**Paso 2 — Datos de ejemplo** (dentistas, pacientes, citas):
```
supabase/seed.sql
```

### 5. Arrancar en local

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Credenciales de prueba

### Paciente (acceso público)

| Campo | Valor |
|-------|-------|
| Email | demo@dentalviva.es |
| Contraseña | DentalViva2026! |
| DNI | 99999999Z |

### Dentistas (panel de administración)

| Nombre | Email | Contraseña | Especialidad |
|--------|-------|------------|--------------|
| Dr. Carlos Mendoza | carlos.mendoza@dentalviva.es | DentalViva2026! | Implantología |
| Dra. Ana García | ana.garcia@dentalviva.es | DentalViva2026! | Blanqueamiento Dental |
| Dr. Luis Torres | luis.torres@dentalviva.es | DentalViva2026! | Diseño de Sonrisa |

El seed también crea 50 pacientes de prueba y 100 citas distribuidas entre los tres dentistas.

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Vista previa del build
npm run typecheck  # Verificación de tipos TypeScript
```

---

## Estructura del proyecto

```
src/
├── auth/           # Contexto de autenticación
├── components/     # Componentes reutilizables (UI, secciones, layout)
├── lib/            # Cliente Supabase y tipos de base de datos
├── pages/          # Páginas (landing, login, registro, citas, admin)
│   └── admin/      # Panel de administración para dentistas
├── services/       # Lógica de acceso a datos (citas, admin)
├── types/          # Tipos TypeScript compartidos
└── utils/          # Utilidades (perfil, helpers de admin)
supabase/
├── setup.sql       # Schema completo (ejecutar primero)
└── seed.sql        # Datos de ejemplo (ejecutar segundo)
```
