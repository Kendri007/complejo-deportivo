import { CalendarDays, Clock, LayoutDashboard, LogOut, MapPin, Settings, User } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthProvider'
import { signOut } from '@/features/auth/api'

function navItems(complexId: string) {
  return [
    { to: `/admin/${complexId}`, label: 'Inicio', icon: LayoutDashboard, end: true },
    { to: `/admin/${complexId}/courts`, label: 'Canchas', icon: MapPin },
    { to: `/admin/${complexId}/schedule`, label: 'Horarios', icon: Clock },
    { to: `/admin/${complexId}/reservations`, label: 'Reservas', icon: CalendarDays },
    { to: `/admin/${complexId}/settings`, label: 'Configuración', icon: Settings },
  ]
}

export function AdminSidebar({
  complexId,
  onNavigate,
}: {
  complexId: string
  onNavigate?: () => void
}) {
  const { role } = useAuth()

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/admin" className="text-lg font-extrabold tracking-tight" onClick={onNavigate}>
        Complejo Deportivo
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems(complexId).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-card'
              }`
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        {role === 'super_admin' && (
          <Link
            to="/super-admin"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
          >
            <LayoutDashboard className="size-4" />
            Super admin
          </Link>
        )}
        <Link
          to="/app"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
        >
          <User className="size-4" />
          Ver como cliente
        </Link>
        <Button
          variant="ghost"
          className="justify-start gap-3 px-3 text-muted-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="size-4" />
          Salir
        </Button>
      </div>
    </div>
  )
}
