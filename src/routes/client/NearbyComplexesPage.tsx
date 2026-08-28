import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddressAutocomplete } from '@/features/geolocation/components/AddressAutocomplete'
import { useGeolocation } from '@/features/geolocation/hooks'
import { useNearbyComplexes } from '@/features/complexes/hooks'

export function NearbyComplexesPage() {
  const geo = useGeolocation()
  const [manualAddress, setManualAddress] = useState('')
  const [showManualSearch, setShowManualSearch] = useState(false)

  const coords = geo.status === 'success' ? { lat: geo.lat, lng: geo.lng } : null
  const { data: complexes, isLoading } = useNearbyComplexes(coords)

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Complejos cerca tuyo</h1>

      {geo.status === 'loading' && (
        <p className="text-sm text-muted-foreground">Buscando tu ubicación...</p>
      )}

      {geo.status === 'error' && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <p className="text-sm text-destructive">{geo.message}</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={geo.retry}>
              Reintentar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowManualSearch((v) => !v)}
            >
              Buscar por dirección
            </Button>
          </div>
        </div>
      )}

      {(showManualSearch || (geo.status === 'success' && geo.manual)) && (
        <AddressAutocomplete
          id="manual-location"
          label="Tu dirección"
          value={manualAddress}
          onChange={setManualAddress}
          onPlaceSelected={(place) => {
            setManualAddress(place.address)
            geo.setManualLocation(place.lat, place.lng)
            setShowManualSearch(false)
          }}
        />
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Cargando complejos...</p>}

      {complexes && complexes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No encontramos complejos cerca tuyo todavía.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {complexes?.map((complex) => (
          <Link key={complex.id} to={`/app/complexes/${complex.id}`}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{complex.name}</p>
                  <p className="text-sm text-muted-foreground">{complex.address}</p>
                </div>
                <span className="text-sm font-medium text-primary">
                  {complex.distance_km.toFixed(1)} km
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
