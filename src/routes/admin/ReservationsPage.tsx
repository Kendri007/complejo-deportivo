import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StatTile } from '@/components/shared/StatTile'
import { CourtCalendar, type SelectedSlot } from '@/features/reservations/components/CourtCalendar'
import { useAllCourts } from '@/features/courts/hooks'
import { useOperatingHours } from '@/features/schedule/hooks'
import { useCancelReservationAsAdmin, useComplexReservations } from '@/features/reservations/hooks'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function ReservationsPage() {
  const { complexId } = useParams<{ complexId: string }>()
  const { data: courts } = useAllCourts(complexId)
  const { data: reservations, isLoading } = useComplexReservations(complexId)
  const cancelReservation = useCancelReservationAsAdmin(complexId ?? '')

  const [courtId, setCourtId] = useState<string | undefined>(undefined)
  const [weekStart, setWeekStart] = useState(startOfToday())
  const [selected, setSelected] = useState<SelectedSlot | null>(null)

  const activeCourtId = courtId ?? courts?.[0]?.id
  const { data: operatingHours } = useOperatingHours(activeCourtId)

  if (!complexId) return null

  const totalRevenue = reservations?.reduce((sum, r) => sum + (r.price ?? 0), 0) ?? 0
  const selectedReservation =
    selected && activeCourtId
      ? reservations?.find(
          (r) =>
            r.court_id === activeCourtId &&
            r.date === selected.date &&
            r.start_time.slice(0, 5) === selected.time,
        )
      : undefined

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-xl font-bold">Reservas</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Reservas confirmadas" value={String(reservations?.length ?? 0)} />
        <StatTile label="Ingresos estimados" value={`$${totalRevenue.toFixed(0)}`} />
      </div>

      {courts && courts.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {courts.map((court) => (
              <button
                key={court.id}
                type="button"
                onClick={() => {
                  setCourtId(court.id)
                  setSelected(null)
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  court.id === activeCourtId
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                {court.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const d = new Date(weekStart)
                d.setDate(d.getDate() - 7)
                setWeekStart(d)
              }}
            >
              ← Semana anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const d = new Date(weekStart)
                d.setDate(d.getDate() + 7)
                setWeekStart(d)
              }}
            >
              Semana siguiente →
            </Button>
          </div>

          {activeCourtId && (
            <CourtCalendar
              courtId={activeCourtId}
              weekStart={weekStart}
              operatingHours={operatingHours}
              selected={selected}
              onSelect={setSelected}
              disableOccupied={false}
            />
          )}

          {selected && (
            <div className="rounded-lg border border-border p-3">
              {selectedReservation ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {selected.date} · {selected.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedReservation.client_name ?? 'Cliente'} ·{' '}
                      {selectedReservation.type === 'match' ? 'Partido' : 'Privada'} ·{' '}
                      {selectedReservation.price != null ? `$${selectedReservation.price}` : 'Sin precio'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={cancelReservation.isPending}
                    onClick={() => {
                      if (window.confirm('¿Cancelar esta reserva?')) {
                        cancelReservation.mutate(selectedReservation.id, {
                          onSuccess: () => setSelected(null),
                        })
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {selected.date} · {selected.time} está libre.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold">Todas las reservas</h2>
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
                  {r.price != null ? ` · $${r.price}` : ''}
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
    </div>
  )
}
