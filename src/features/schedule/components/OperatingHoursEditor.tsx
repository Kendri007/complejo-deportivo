import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DAYS_OF_WEEK } from '@/features/schedule/types'
import { useOperatingHours, useReplaceOperatingHours } from '@/features/schedule/hooks'

type DayRow = { open: boolean; open_time: string; close_time: string }

const DEFAULT_ROW: DayRow = { open: false, open_time: '09:00', close_time: '23:00' }

export function OperatingHoursEditor({ courtId }: { courtId: string }) {
  const { data: hours, isLoading } = useOperatingHours(courtId)
  const replaceHours = useReplaceOperatingHours(courtId)
  const [rows, setRows] = useState<Record<number, DayRow>>({})

  useEffect(() => {
    if (!hours) return
    const next: Record<number, DayRow> = {}
    for (const day of DAYS_OF_WEEK) {
      const existing = hours.find((h) => h.day_of_week === day.value)
      next[day.value] = existing
        ? { open: true, open_time: existing.open_time.slice(0, 5), close_time: existing.close_time.slice(0, 5) }
        : { ...DEFAULT_ROW }
    }
    setRows(next)
  }, [hours])

  function updateRow(day: number, patch: Partial<DayRow>) {
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  function handleSave() {
    const payload = DAYS_OF_WEEK.filter((d) => rows[d.value]?.open).map((d) => ({
      day_of_week: d.value,
      open_time: rows[d.value].open_time,
      close_time: rows[d.value].close_time,
    }))
    replaceHours.mutate(payload)
  }

  if (isLoading || Object.keys(rows).length === 0) {
    return <p className="text-sm text-muted-foreground">Cargando horarios...</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {DAYS_OF_WEEK.map((day) => {
        const row = rows[day.value]
        return (
          <div
            key={day.value}
            className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center justify-between gap-3 sm:w-32">
              <span className="text-sm font-medium">{day.label}</span>
              <Switch
                checked={row.open}
                onCheckedChange={(checked) => updateRow(day.value, { open: checked })}
              />
            </div>
            {row.open && (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  className="w-28"
                  value={row.open_time}
                  onChange={(e) => updateRow(day.value, { open_time: e.target.value })}
                />
                <span className="text-muted-foreground">a</span>
                <Input
                  type="time"
                  className="w-28"
                  value={row.close_time}
                  onChange={(e) => updateRow(day.value, { close_time: e.target.value })}
                />
              </div>
            )}
          </div>
        )
      })}

      {replaceHours.isError && (
        <p className="text-sm text-destructive">{(replaceHours.error as Error).message}</p>
      )}

      <Button type="button" onClick={handleSave} disabled={replaceHours.isPending}>
        {replaceHours.isPending ? 'Guardando...' : 'Guardar horarios'}
      </Button>
    </div>
  )
}
