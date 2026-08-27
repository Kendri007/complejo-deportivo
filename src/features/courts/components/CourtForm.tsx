import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export type CourtFormValues = {
  name: string
  surface: string | null
  is_indoor: boolean
  is_active: boolean
  price_per_hour: number | null
  default_capacity: number | null
}

const emptyValues: CourtFormValues = {
  name: '',
  surface: '',
  is_indoor: false,
  is_active: true,
  price_per_hour: null,
  default_capacity: 4,
}

export function CourtForm({
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  initialValues?: Partial<CourtFormValues>
  submitLabel: string
  submitting: boolean
  error: string | null
  onSubmit: (values: CourtFormValues) => void
  onCancel?: () => void
}) {
  const [values, setValues] = useState<CourtFormValues>({ ...emptyValues, ...initialValues })

  function update<K extends keyof CourtFormValues>(key: K, value: CourtFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="court-name">Nombre de la cancha</Label>
        <Input
          id="court-name"
          required
          placeholder="Cancha 1"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="court-surface">Superficie</Label>
        <Input
          id="court-surface"
          placeholder="Cristal, panorámica..."
          value={values.surface ?? ''}
          onChange={(e) => update('surface', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="court-price">Precio por hora</Label>
          <Input
            id="court-price"
            type="number"
            step="any"
            min={0}
            value={values.price_per_hour ?? ''}
            onChange={(e) =>
              update('price_per_hour', e.target.value === '' ? null : Number(e.target.value))
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="court-capacity">Jugadores objetivo</Label>
          <Input
            id="court-capacity"
            type="number"
            min={2}
            value={values.default_capacity ?? ''}
            onChange={(e) =>
              update('default_capacity', e.target.value === '' ? null : Number(e.target.value))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor="court-indoor">Techada</Label>
        <Switch
          id="court-indoor"
          checked={values.is_indoor}
          onCheckedChange={(checked) => update('is_indoor', checked)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor="court-active">Activa (visible para clientes)</Label>
        <Switch
          id="court-active"
          checked={values.is_active}
          onCheckedChange={(checked) => update('is_active', checked)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
