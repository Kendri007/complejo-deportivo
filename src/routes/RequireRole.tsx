import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type Role } from '@/context/AuthProvider'

export function RequireRole({ roles }: { roles: Role[] }) {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />

  return <Outlet />
}
