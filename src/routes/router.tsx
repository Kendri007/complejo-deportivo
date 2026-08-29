import { createBrowserRouter } from 'react-router-dom'
import { RequireRole } from '@/routes/RequireRole'
import { StubPage } from '@/routes/StubPage'
import { HomePage } from '@/routes/public/HomePage'
import { LoginPage } from '@/routes/public/LoginPage'
import { SignupPage } from '@/routes/public/SignupPage'
import { RegisterComplexPage } from '@/routes/public/RegisterComplexPage'
import { ClientLayout } from '@/routes/client/ClientLayout'
import { NearbyComplexesPage } from '@/routes/client/NearbyComplexesPage'
import { ComplexDetailPage as ClientComplexDetailPage } from '@/routes/client/ComplexDetailPage'
import { BookCourtPage } from '@/routes/client/BookCourtPage'
import { MatchesPage } from '@/routes/client/MatchesPage'
import { MatchDetailPage } from '@/routes/client/MatchDetailPage'
import { MyReservationsPage } from '@/routes/client/MyReservationsPage'
import { ProfilePage } from '@/routes/client/ProfilePage'
import { AdminLayout } from '@/routes/admin/AdminLayout'
import { AdminHomePage } from '@/routes/admin/AdminHomePage'
import { DashboardPage as AdminDashboardPage } from '@/routes/admin/DashboardPage'
import { CourtsPage } from '@/routes/admin/CourtsPage'
import { SchedulePage } from '@/routes/admin/SchedulePage'
import { ReservationsPage } from '@/routes/admin/ReservationsPage'
import { SettingsPage } from '@/routes/admin/SettingsPage'
import { SuperAdminLayout } from '@/routes/super-admin/SuperAdminLayout'
import { ComplexesPage } from '@/routes/super-admin/ComplexesPage'
import { NewComplexPage } from '@/routes/super-admin/NewComplexPage'
import { ComplexDetailPage } from '@/routes/super-admin/ComplexDetailPage'
import { DashboardPage } from '@/routes/super-admin/DashboardPage'
import { UsersPage } from '@/routes/super-admin/UsersPage'

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
          { index: true, element: <NearbyComplexesPage /> },
          { path: 'complexes/:complexId', element: <ClientComplexDetailPage /> },
          {
            path: 'complexes/:complexId/courts/:courtId/book',
            element: <BookCourtPage />,
          },
          { path: 'matches', element: <MatchesPage /> },
          { path: 'matches/:matchId', element: <MatchDetailPage /> },
          { path: 'my-reservations', element: <MyReservationsPage /> },
          { path: 'profile', element: <ProfilePage /> },
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
          { path: ':complexId', element: <AdminDashboardPage /> },
          { path: ':complexId/courts', element: <CourtsPage /> },
          { path: ':complexId/schedule', element: <SchedulePage /> },
          { path: ':complexId/reservations', element: <ReservationsPage /> },
          { path: ':complexId/settings', element: <SettingsPage /> },
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
          { path: 'users', element: <UsersPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <StubPage title="Página no encontrada" /> },
])
