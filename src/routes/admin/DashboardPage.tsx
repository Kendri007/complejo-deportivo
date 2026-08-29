import { Link, useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { StatTile } from '@/components/shared/StatTile'
import { toDateKey } from '@/components/shared/DatePill'
import { useAllCourts } from '@/features/courts/hooks'
import { useComplexReservations } from '@/features/reservations/hooks'

export function DashboardPage() {
  const { complexId } = useParams<{ complexId: string }>()
  const { data: courts, isLoading: loadingCourts } = useAllCourts(complexId)
  const { data: reservations, isLoading: loadingReservations } = useComplexReservations(complexId)

  const loading = loadingCourts || loadingReservations

  const today = toDateKey(new Date())
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndKey = toDateKey(weekEnd)

  const activeCourts = courts?.filter((c) => c.is_active).length ?? 0
  const reservationsToday = reservations?.filter((r) => r.date === today).length ?? 0
  const reservationsThisWeek =
    reservations?.filter((r) => r.date >= today && r.date <= weekEndKey).length ?? 0
  const revenueThisWeek =
    reservations
      ?.filter((r) => r.date >= today && r.date <= weekEndKey)
      .reduce((sum, r) => sum + (r.price ?? 0), 0) ?? 0

  if (!complexId) return null

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-xl font-bold">Inicio</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Canchas activas" value={String(activeCourts)} />
          <StatTile label="Reservas hoy" value={String(reservationsToday)} />
          <StatTile label="Reservas próximos 7 días" value={String(reservationsThisWeek)} />
          <StatTile label="Ingresos estimados (7 días)" value={`$${revenueThisWeek.toFixed(0)}`} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to={`/admin/${complexId}/courts`}>
            <Card>
              <CardContent className="p-4 font-medium">Canchas</CardContent>
            </Card>
          </Link>
          <Link to={`/admin/${complexId}/schedule`}>
            <Card>
              <CardContent className="p-4 font-medium">Horarios</CardContent>
            </Card>
          </Link>
          <Link to={`/admin/${complexId}/reservations`}>
            <Card>
              <CardContent className="p-4 font-medium">Reservas</CardContent>
            </Card>
          </Link>
          <Link to={`/admin/${complexId}/settings`}>
            <Card>
              <CardContent className="p-4 font-medium">Configuración</CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
