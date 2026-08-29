import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toDateKey } from '@/components/shared/DatePill'
import { CourtCalendar, type SelectedSlot } from '@/features/reservations/components/CourtCalendar'
import { PaymentMethodPicker } from '@/features/reservations/components/PaymentMethodPicker'
import { useCourt } from '@/features/courts/hooks'
import { courtSportLabels } from '@/features/courts/types'
import { useOperatingHours } from '@/features/schedule/hooks'
import { useCreateReservation } from '@/features/reservations/hooks'
import { getMatchIdForReservation } from '@/features/reservations/api'
import type { PaymentMethod } from '@/types/database.types'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function BookCourtPage() {
  const { complexId, courtId } = useParams<{ complexId: string; courtId: string }>()
  const navigate = useNavigate()
  const { data: court } = useCourt(courtId)
  const { data: operatingHours } = useOperatingHours(courtId)

  const [weekStart, setWeekStart] = useState(startOfToday())
  const [selected, setSelected] = useState<SelectedSlot | null>(null)
  const [reservationType, setReservationType] = useState<'private' | 'match'>('private')
  const [targetPlayers, setTargetPlayers] = useState(court?.default_capacity ?? 4)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
  const [paymentReference, setPaymentReference] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createReservation = useCreateReservation()

  if (!complexId || !courtId) return null

  const isThisWeek = toDateKey(weekStart) === toDateKey(startOfToday())

  function handleSubmit() {
    if (!selected) return
    setError(null)
    createReservation.mutate(
      {
        courtId: courtId!,
        date: selected.date,
        startTime: selected.time,
        type: reservationType,
        matchTargetPlayers: reservationType === 'match' ? targetPlayers : undefined,
        paymentMethod,
        paymentReference: paymentReference || undefined,
      },
      {
        onSuccess: async (reservationId) => {
          if (reservationType === 'match') {
            const matchId = await getMatchIdForReservation(reservationId)
            navigate(`/app/matches/${matchId}`)
          } else {
            navigate('/app/my-reservations')
          }
        },
        onError: (err) => setError((err as Error).message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-bold">{court?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {court?.complexes?.name} · {court && courtSportLabels(court)}
        </p>
        {court?.price_per_hour != null && (
          <p className="mt-1 text-sm">
            <span className="font-semibold text-primary">${court.price_per_hour} / hora</span>{' '}
            <span className="text-muted-foreground">
              · pagás por transferencia o en efectivo, no hay cobro con tarjeta
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isThisWeek}
            onClick={() => {
              const d = new Date(weekStart)
              d.setDate(d.getDate() - 7)
              setWeekStart(d.getTime() < startOfToday().getTime() ? startOfToday() : d)
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

        <CourtCalendar
          courtId={courtId}
          weekStart={weekStart}
          operatingHours={operatingHours}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Elegiste: {selected.date} a las {selected.time}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={reservationType === 'private' ? 'default' : 'secondary'}
                className="flex-1"
                onClick={() => setReservationType('private')}
              >
                Reserva privada
              </Button>
              <Button
                type="button"
                variant={reservationType === 'match' ? 'default' : 'secondary'}
                className="flex-1"
                onClick={() => setReservationType('match')}
              >
                Crear partido
              </Button>
            </div>
            {reservationType === 'match' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="target-players">Jugadores objetivo (incluído vos)</Label>
                <Input
                  id="target-players"
                  type="number"
                  min={2}
                  value={targetPlayers}
                  onChange={(e) => setTargetPlayers(Number(e.target.value) || 2)}
                />
              </div>
            )}
          </div>

          {court?.complexes && (
            <PaymentMethodPicker
              complex={court.complexes}
              method={paymentMethod}
              onMethodChange={setPaymentMethod}
              reference={paymentReference}
              onReferenceChange={setPaymentReference}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button size="lg" disabled={createReservation.isPending} onClick={handleSubmit}>
            {createReservation.isPending
              ? 'Reservando...'
              : reservationType === 'match'
                ? 'Crear partido'
                : 'Reservar'}
          </Button>
        </>
      )}
    </div>
  )
}
