export type GeocodeSuggestion = { address: string; lat: number; lng: number }

// Nominatim (OpenStreetMap): gratis, sin API key. Respetar su política de uso
// (~1 req/seg) — el componente que llama a esto debouncea la búsqueda.
export async function searchAddress(query: string): Promise<GeocodeSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('q', trimmed)
  url.searchParams.set('limit', '5')

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('No se pudo buscar la dirección.')

  const data: { display_name: string; lat: string; lon: string }[] = await res.json()
  return data.map((item) => ({
    address: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }))
}
