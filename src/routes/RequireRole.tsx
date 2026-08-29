import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '@/context/AuthProvider'

export function RequireRole({ roles }: { roles: Role[] }) {
  const { session, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (!session) {
    // Guardamos a dónde quería ir para volver ahí después de loguearse, en
    // vez de dejarlo tirado en /app sin memoria de qué quería ver/reservar.
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />

  return <Outlet />
}
