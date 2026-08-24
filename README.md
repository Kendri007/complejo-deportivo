# Complejo Deportivo

PWA mobile-first para reservar canchas de fútbol, beach fútbol/vóley/tenis, tenis y pádel en múltiples complejos deportivos. Los clientes buscan complejos cercanos, reservan un slot de 1 hora o se unen a un partido abierto; cada complejo tiene su propio admin, y un super-admin gestiona la plataforma completa.

## Stack

- [Vite](https://vite.dev/) + React + TypeScript (SPA)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security, Realtime)
- [react-router-dom](https://reactrouter.com/) v7 · [@tanstack/react-query](https://tanstack.com/query)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (instalable, offline app-shell)

## Setup

```bash
npm install
cp .env.example .env   # completar con las credenciales del proyecto Supabase
npm run dev
```

## Estructura

```
src/
  routes/       # árbol de rutas + guards por rol (client / admin / super-admin)
  components/   # ui/ (shadcn) y shared/ (componentes propios reutilizables)
  features/     # auth, complexes, courts, reservations, matches, geolocation
  lib/          # cliente de Supabase, query client, utils
  context/      # AuthProvider (sesión, perfil, rol)
  types/        # tipos generados de Supabase
supabase/
  migrations/   # esquema, RLS y funciones RPC
```
