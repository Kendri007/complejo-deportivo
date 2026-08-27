import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { searchAddress, type GeocodeSuggestion } from '@/lib/geocoding'

export type PlaceSelection = GeocodeSuggestion

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
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 3) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true)
      searchAddress(value)
        .then((results) => {
          setSuggestions(results)
          setOpen(true)
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  return (
    <div className="relative flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        autoComplete="off"
        placeholder="Empezá a escribir la dirección..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {loading && <p className="text-xs text-muted-foreground">Buscando...</p>}
      {open && suggestions.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {suggestions.map((s) => (
            <li key={`${s.lat}-${s.lng}`}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onChange(s.address)
                  onPlaceSelected(s)
                  setOpen(false)
                }}
              >
                {s.address}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
