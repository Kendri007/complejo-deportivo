import { createBrowserRouter } from 'react-router-dom'
import { RequireRole } from '@/routes/RequireRole'
import { StubPage } from '@/routes/StubPage'
import { HomePage } from '@/routes/public/HomePage'
import { LoginPage } from '@/routes/public/LoginPage'
import { SignupPage } from '@/routes/public/SignupPage'
import { RegisterComplexPage } from '@/routes/public/RegisterComplexPage'
import { ClientLayout } from '@/routes/client/ClientLayout'
import { AdminLayout } from '@/routes/admin/AdminLayout'
import { AdminHomePage } from '@/routes/admin/AdminHomePage'
import { CourtsPage } from '@/routes/admin/CourtsPage'
import { SchedulePage } from '@/routes/admin/SchedulePage'
import { ReservationsPage } from '@/routes/admin/ReservationsPage'
import { SuperAdminLayout } from '@/routes/super-admin/SuperAdminLayout'
import { ComplexesPage } from '@/routes/super-admin/ComplexesPage'
import { NewComplexPage } from '@/routes/super-admin/NewComplexPage'
import { ComplexDetailPage } from '@/routes/super-admin/ComplexDetailPage'
import { DashboardPage } from '@/routes/super-admin/DashboardPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/register-complex', element: <RegisterComplexPage /> },

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
          { index: true, element: <AdminHomePage /> },
          { path: ':complexId/courts', element: <CourtsPage /> },
          { path: ':complexId/schedule', element: <SchedulePage /> },
          { path: ':complexId/reservations', element: <ReservationsPage /> },
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
          { index: true, element: <DashboardPage /> },
          { path: 'complexes', element: <ComplexesPage /> },
          { path: 'complexes/new', element: <NewComplexPage /> },
          { path: 'complexes/:id', element: <ComplexDetailPage /> },
          { path: 'users', element: <StubPage title="Usuarios" /> },
        ],
      },
    ],
  },

  { path: '*', element: <StubPage title="Página no encontrada" /> },
])
