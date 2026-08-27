import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCancelReservationAsAdmin, useComplexReservations } from '@/features/reservations/hooks'

export function ReservationsPage() {
  const { complexId } = useParams<{ complexId: string }>()
  const { data: reservations, isLoading } = useComplexReservations(complexId)
  const cancelReservation = useCancelReservationAsAdmin(complexId ?? '')

  if (!complexId) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Reservas</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      {reservations && reservations.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay reservas confirmadas todavía.</p>
      )}

      <div className="flex flex-col gap-3">
        {reservations?.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-semibold">
                {r.courts.name} · {r.date}
              </p>
              <p className="text-sm text-muted-foreground">
                {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)} ·{' '}
                {r.client_name ?? 'Cliente'} · {r.type === 'match' ? 'Partido' : 'Privada'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={cancelReservation.isPending}
              onClick={() => {
                if (window.confirm('¿Cancelar esta reserva?')) {
                  cancelReservation.mutate(r.id)
                }
              }}
            >
              Cancelar
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
