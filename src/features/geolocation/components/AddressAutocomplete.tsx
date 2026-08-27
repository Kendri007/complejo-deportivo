import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isGoogleMapsConfigured, loadPlacesLibrary } from '@/lib/googleMaps'

export type PlaceSelection = { address: string; lat: number; lng: number }

export function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  onPlaceSelected,
}: {
  id: string
  label: string
  value: string
  onChange: (address: string) => void
  onPlaceSelected: (place: PlaceSelection) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)
  const configured = isGoogleMapsConfigured()

  useEffect(() => {
    if (!configured || !inputRef.current) return
    let autocomplete: google.maps.places.Autocomplete | undefined
    let listener: google.maps.MapsEventListener | undefined

    loadPlacesLibrary()
      .then((places) => {
        if (!inputRef.current) return
        autocomplete = new places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry'],
        })
        listener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete!.getPlace()
          const location = place.geometry?.location
          if (!location) return
          onChange(place.formatted_address ?? inputRef.current!.value)
          onPlaceSelected({
            address: place.formatted_address ?? inputRef.current!.value,
            lat: location.lat(),
            lng: location.lng(),
          })
        })
        setReady(true)
      })
      .catch(() => setReady(false))

    return () => {
      listener?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured])

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        ref={inputRef}
        autoComplete="off"
        placeholder={configured ? 'Empezá a escribir la dirección...' : 'Dirección'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {!configured && (
        <p className="text-xs text-muted-foreground">
          Autocompletado no disponible (falta configurar Google Maps). La dirección se guarda
          como texto libre, sin coordenadas.
        </p>
      )}
      {configured && !ready && (
        <p className="text-xs text-muted-foreground">Cargando autocompletado...</p>
      )}
    </div>
  )
}
