import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { signOut } from '@/features/auth/api'

export function SuperAdminLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border p-4">
        <span className="font-bold">Super Admin</span>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">Panel de complejos</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/app">Ver como cliente</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Salir
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
