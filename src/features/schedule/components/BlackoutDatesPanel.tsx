import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useBlackoutDates,
  useCreateBlackoutDate,
  useDeleteBlackoutDate,
} from '@/features/schedule/hooks'

export function BlackoutDatesPanel({
  complexId,
  courtId,
}: {
  complexId: string
  courtId: string
}) {
  const { data: blackouts, isLoading } = useBlackoutDates(complexId, courtId)
  const createBlackout = useCreateBlackoutDate(complexId, courtId)
  const deleteBlackout = useDeleteBlackoutDate(complexId, courtId)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    createBlackout.mutate(
      { complex_id: complexId, court_id: courtId, date, all_day: true, reason: reason || null },
      {
        onSuccess: () => {
          setDate('')
          setReason('')
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      {blackouts && blackouts.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin fechas bloqueadas.</p>
      )}

      <ul className="flex flex-col gap-2">
        {blackouts?.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium">{b.date}</p>
              {b.reason && <p className="text-xs text-muted-foreground">{b.reason}</p>}
              {b.court_id === null && (
                <p className="text-xs text-muted-foreground">Todo el complejo</p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={deleteBlackout.isPending}
              onClick={() => deleteBlackout.mutate(b.id)}
            >
              Quitar
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <Label htmlFor="blackout-date">Bloquear una fecha para esta cancha</Label>
        <div className="flex gap-2">
          <Input
            id="blackout-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            placeholder="Motivo (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button type="submit" disabled={createBlackout.isPending}>
            Bloquear
          </Button>
        </div>
        {createBlackout.isError && (
          <p className="text-sm text-destructive">{(createBlackout.error as Error).message}</p>
        )}
      </form>
    </div>
  )
}
