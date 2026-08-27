import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePill, nextDays, toDateKey } from '@/components/shared/DatePill'
import { TimeSlotChip } from '@/components/shared/TimeSlotChip'
import { useCourt } from '@/features/courts/hooks'
import { useOperatingHours } from '@/features/schedule/hooks'
import {
  useAvailableSlots,
  useCreateReservation,
} from '@/features/reservations/hooks'
import { getMatchIdForReservation } from '@/features/reservations/api'

function generateHourlySlots(openTime: string, closeTime: string) {
  const openHour = Number(openTime.slice(0, 2))
  const closeHour = Number(closeTime.slice(0, 2))
  const slots: string[] = []
  for (let h = openHour; h < closeHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
}

export function BookCourtPage() {
  const { complexId, courtId } = useParams<{ complexId: string; courtId: string }>()
  const navigate = useNavigate()
  const { data: court } = useCourt(courtId)
  const { data: operatingHours } = useOperatingHours(courtId)

  const days = nextDays(14)
  const [selectedDate, setSelectedDate] = useState(days[0])
  const dateKey = toDateKey(selectedDate)
  const { data: occupiedSlots } = useAvailableSlots(courtId, dateKey)

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [reservationType, setReservationType] = useState<'private' | 'match'>('private')
  const [targetPlayers, setTargetPlayers] = useState(court?.default_capacity ?? 4)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedSlot(null)
  }, [dateKey])

  useEffect(() => {
    if (court?.default_capacity) setTargetPlayers(court.default_capacity)
  }, [court?.default_capacity])

  const createReservation = useCreateReservation()

  if (!complexId || !courtId) return null

  const dayRule = operatingHours?.find((h) => h.day_of_week === selectedDate.getDay())
  const candidateSlots = dayRule
    ? generateHourlySlots(dayRule.open_time, dayRule.close_time)
    : []
  const occupiedSet = new Set((occupiedSlots ?? []).map((t) => t.slice(0, 5)))

  function handleSubmit() {
    if (!selectedSlot) return
    setError(null)
    createReservation.mutate(
      {
        courtId: courtId!,
        date: dateKey,
        startTime: selectedSlot,
        type: reservationType,
        matchTargetPlayers: reservationType === 'match' ? targetPlayers : undefined,
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
          {court?.complexes?.name} · {court?.sports?.label}
          {court?.price_per_hour ? ` · $${court.price_per_hour}/h` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Elegí una fecha</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((day) => (
            <DatePill
              key={toDateKey(day)}
              date={day}
              selected={toDateKey(day) === dateKey}
              onClick={() => setSelectedDate(day)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Elegí un horario</p>
        {!dayRule && (
          <p className="text-sm text-muted-foreground">
            La cancha no atiende este día.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {candidateSlots.map((slot) => {
            const endHour = String(Number(slot.slice(0, 2)) + 1).padStart(2, '0')
            return (
              <TimeSlotChip
                key={slot}
                startTime={slot}
                endTime={`${endHour}:00`}
                selected={selectedSlot === slot}
                disabled={occupiedSet.has(slot)}
                onClick={() => setSelectedSlot(slot)}
              />
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Tipo de reserva</p>
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        size="lg"
        disabled={!selectedSlot || createReservation.isPending}
        onClick={handleSubmit}
      >
        {createReservation.isPending
          ? 'Reservando...'
          : reservationType === 'match'
            ? 'Crear partido'
            : 'Reservar'}
      </Button>
    </div>
  )
}
