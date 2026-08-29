import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AddressAutocomplete } from '@/features/geolocation/components/AddressAutocomplete'
import { ComplexPhotoUpload } from '@/features/complexes/components/ComplexPhotoUpload'
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
  payment_pago_movil: '',
  payment_binance: '',
  payment_zinli: '',
  payment_zelle: '',
}

export function ComplexForm({
  complexId,
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: {
  complexId?: string
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

      {complexId ? (
        <ComplexPhotoUpload
          complexId={complexId}
          coverImageUrl={values.cover_image_url}
          onUploaded={(url) => update('cover_image_url', url)}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="cover_image_url">URL de foto de portada (opcional)</Label>
          <Input
            id="cover_image_url"
            placeholder="Podés subir una foto después de crear el complejo"
            value={values.cover_image_url ?? ''}
            onChange={(e) => update('cover_image_url', e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
        <p className="text-sm font-semibold">Datos para cobrar (opcional)</p>
        <p className="text-xs text-muted-foreground">
          Se le muestran al cliente al reservar. Dejá vacío el método que no acepten — siempre
          pueden pagar en efectivo en el complejo.
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="payment_pago_movil">Pago Móvil</Label>
          <Textarea
            id="payment_pago_movil"
            placeholder="Banco, teléfono y CI"
            value={values.payment_pago_movil ?? ''}
            onChange={(e) => update('payment_pago_movil', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="payment_binance">Binance</Label>
          <Input
            id="payment_binance"
            placeholder="ID de Binance o email"
            value={values.payment_binance ?? ''}
            onChange={(e) => update('payment_binance', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="payment_zinli">Zinli</Label>
          <Input
            id="payment_zinli"
            placeholder="Tag o email de Zinli"
            value={values.payment_zinli ?? ''}
            onChange={(e) => update('payment_zinli', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="payment_zelle">Zelle</Label>
          <Input
            id="payment_zelle"
            placeholder="Email de Zelle"
            value={values.payment_zelle ?? ''}
            onChange={(e) => update('payment_zelle', e.target.value)}
          />
        </div>
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
