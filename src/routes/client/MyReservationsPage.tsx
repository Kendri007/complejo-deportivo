import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCancelMyReservation, useMyReservations } from '@/features/reservations/hooks'

export function MyReservationsPage() {
  const { data: reservations, isLoading } = useMyReservations()
  const cancelReservation = useCancelMyReservation()

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Mis reservas</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {reservations && reservations.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no tenés reservas.</p>
      )}

      <div className="flex flex-col gap-3">
        {reservations?.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">
                  {r.courts?.sports?.label} · {r.courts?.complexes?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {r.courts?.name} · {r.date} · {r.start_time.slice(0, 5)}-{r.end_time.slice(0, 5)}
                  {r.type === 'match' ? ' · Partido' : ''}
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
