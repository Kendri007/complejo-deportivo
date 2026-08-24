import { Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { signOut } from '@/features/auth/api'

export function AdminLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border p-4">
        <span className="font-bold">Panel de complejo</span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Salir
        </Button>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
