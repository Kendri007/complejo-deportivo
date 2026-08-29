import { toDateKey } from '@/components/shared/DatePill'
import { useWeekAvailability } from '@/features/reservations/hooks'
import type { OperatingHour } from '@/features/schedule/types'

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export type SelectedSlot = { date: string; time: string }

export function CourtCalendar({
  courtId,
  weekStart,
  operatingHours,
  selected,
  onSelect,
}: {
  courtId: string
  weekStart: Date
  operatingHours: OperatingHour[] | undefined
  selected: SelectedSlot | null
  onSelect: (slot: SelectedSlot) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const startKey = toDateKey(weekStart)
  const { data: occupiedRows, isLoading } = useWeekAvailability(courtId, startKey)

  const occupiedSet = new Set(
    (occupiedRows ?? []).map((r) => `${r.date}|${r.start_time.slice(0, 5)}`),
  )

  const relevantHours = (operatingHours ?? []).filter((h) =>
    days.some((d) => d.getDay() === h.day_of_week),
  )

  if (relevantHours.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta cancha todavía no tiene horarios cargados.
      </p>
    )
  }

  const minHour = Math.min(...relevantHours.map((h) => Number(h.open_time.slice(0, 2))))
  const maxHour = Math.max(...relevantHours.map((h) => Number(h.close_time.slice(0, 2))))
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i)

  function hoursForDay(dayOfWeek: number) {
    return (operatingHours ?? []).find((h) => h.day_of_week === dayOfWeek)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Calendario de disponibilidad</p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" />
          {isLoading ? 'Actualizando...' : 'En vivo'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="w-12" />
              {days.map((d) => (
                <th key={toDateKey(d)} className="pb-1 text-center font-medium">
                  <div className="text-muted-foreground">{WEEKDAY_LABELS[d.getDay()]}</div>
                  <div className="text-sm font-bold">{d.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="pr-2 text-right text-muted-foreground">
                  {String(hour).padStart(2, '0')}:00
                </td>
                {days.map((d) => {
                  const dayKey = toDateKey(d)
                  const dayHours = hoursForDay(d.getDay())
                  const openHour = dayHours ? Number(dayHours.open_time.slice(0, 2)) : null
                  const closeHour = dayHours ? Number(dayHours.close_time.slice(0, 2)) : null
                  const withinHours =
                    openHour !== null && closeHour !== null && hour >= openHour && hour < closeHour
                  const timeStr = `${String(hour).padStart(2, '0')}:00`
                  const isOccupied = occupiedSet.has(`${dayKey}|${timeStr}`)
                  const isSelected = selected?.date === dayKey && selected.time === timeStr

                  if (!withinHours) {
                    return <td key={dayKey} className="rounded-md bg-transparent" />
                  }

                  return (
                    <td key={dayKey}>
                      <button
                        type="button"
                        disabled={isOccupied}
                        onClick={() => onSelect({ date: dayKey, time: timeStr })}
                        className={`h-7 w-full rounded-md border text-[10px] font-medium ${
                          isOccupied
                            ? 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                            : isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-foreground hover:border-primary/50'
                        }`}
                      >
                        {isOccupied ? '✕' : ''}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded border border-border bg-card" /> Libre
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded border border-border bg-muted" /> Ocupado
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded border border-primary bg-primary" /> Elegido
        </span>
      </div>
    </div>
  )
}
