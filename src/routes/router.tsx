import { createBrowserRouter } from 'react-router-dom'
import { RequireRole } from '@/routes/RequireRole'
import { StubPage } from '@/routes/StubPage'
import { HomePage } from '@/routes/public/HomePage'
import { LoginPage } from '@/routes/public/LoginPage'
import { SignupPage } from '@/routes/public/SignupPage'
import { ClientLayout } from '@/routes/client/ClientLayout'
import { AdminLayout } from '@/routes/admin/AdminLayout'
import { SuperAdminLayout } from '@/routes/super-admin/SuperAdminLayout'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },

  {
    path: '/app',
    element: <RequireRole roles={['client', 'complex_admin', 'super_admin']} />,
    children: [
      {
        element: <ClientLayout />,
        children: [
          { index: true, element: <StubPage title="Complejos cerca tuyo" /> },
          { path: 'complexes/:complexId', element: <StubPage title="Detalle de complejo" /> },
          {
            path: 'complexes/:complexId/courts/:courtId/book',
            element: <StubPage title="Reservar cancha" />,
          },
          { path: 'matches', element: <StubPage title="Partidos abiertos" /> },
          { path: 'matches/:matchId', element: <StubPage title="Detalle de partido" /> },
          { path: 'my-reservations', element: <StubPage title="Mis reservas" /> },
          { path: 'profile', element: <StubPage title="Mi perfil" /> },
        ],
      },
    ],
  },

  {
    path: '/admin',
    element: <RequireRole roles={['complex_admin', 'super_admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <StubPage title="Mis complejos" /> },
          { path: ':complexId/courts', element: <StubPage title="Canchas" /> },
          { path: ':complexId/schedule', element: <StubPage title="Horarios" /> },
          { path: ':complexId/reservations', element: <StubPage title="Reservas del complejo" /> },
          { path: ':complexId/settings', element: <StubPage title="Configuración" /> },
        ],
      },
    ],
  },

  {
    path: '/super-admin',
    element: <RequireRole roles={['super_admin']} />,
    children: [
      {
        element: <SuperAdminLayout />,
        children: [
          { index: true, element: <StubPage title="Estadísticas" /> },
          { path: 'complexes', element: <StubPage title="Complejos" /> },
          { path: 'complexes/:id', element: <StubPage title="Detalle de complejo" /> },
          { path: 'complexes/:id/admins', element: <StubPage title="Admins del complejo" /> },
          { path: 'users', element: <StubPage title="Usuarios" /> },
        ],
      },
    ],
  },

  { path: '*', element: <StubPage title="Página no encontrada" /> },
])
