import { NavLink, Outlet, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { signOut } from '@/features/auth/api'

const TABS = [
  { to: 'courts', label: 'Canchas' },
  { to: 'schedule', label: 'Horarios' },
  { to: 'reservations', label: 'Reservas' },
  { to: 'settings', label: 'Configuración' },
]

export function AdminLayout() {
  const { complexId } = useParams<{ complexId: string }>()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border p-4">
        <span className="font-bold">Panel de complejo</span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Salir
        </Button>
      </header>

      {complexId && (
        <nav className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={`/admin/${complexId}/${tab.to}`}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
