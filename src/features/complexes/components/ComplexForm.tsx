import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AddressAutocomplete } from '@/features/geolocation/components/AddressAutocomplete'
import type { ComplexInsert } from '@/features/complexes/types'

export type ComplexFormValues = Omit<ComplexInsert, 'created_by'>

const emptyValues: ComplexFormValues = {
  name: '',
  description: '',
  address: '',
  lat: null,
  lng: null,
  phone: '',
  cover_image_url: '',
  is_active: true,
}

export function ComplexForm({
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: {
  initialValues?: Partial<ComplexFormValues>
  submitLabel: string
  submitting: boolean
  error: string | null
  onSubmit: (values: ComplexFormValues) => void
}) {
  const [values, setValues] = useState<ComplexFormValues>({ ...emptyValues, ...initialValues })

  function update<K extends keyof ComplexFormValues>(key: K, value: ComplexFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          required
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={values.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <AddressAutocomplete
        id="address"
        label="Dirección"
        value={values.address ?? ''}
        onChange={(address) => update('address', address)}
        onPlaceSelected={(place) => {
          update('address', place.address)
          update('lat', place.lat)
          update('lng', place.lng)
        }}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={values.phone ?? ''}
          onChange={(e) => update('phone', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cover_image_url">URL de foto de portada</Label>
        <Input
          id="cover_image_url"
          value={values.cover_image_url ?? ''}
          onChange={(e) => update('cover_image_url', e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor="is_active">Activo (visible para clientes)</Label>
        <Switch
          id="is_active"
          checked={values.is_active ?? true}
          onCheckedChange={(checked) => update('is_active', checked)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  )
}
