import { NavLink } from 'react-router-dom'
import { CalendarDays, MapPin, User, Users } from 'lucide-react'

const TABS = [
  { to: '/app', label: 'Cerca', icon: MapPin, end: true },
  { to: '/app/matches', label: 'Partidos', icon: Users },
  { to: '/app/my-reservations', label: 'Reservas', icon: CalendarDays },
  { to: '/app/profile', label: 'Perfil', icon: User },
]

export function BottomTabBar() {
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-border bg-card">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          <tab.icon className="size-5" />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
