import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (apiKey) {
  setOptions({ key: apiKey, v: 'weekly' })
}

let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | null = null

export function isGoogleMapsConfigured() {
  return !!apiKey
}

export function loadPlacesLibrary() {
  if (!apiKey) {
    return Promise.reject(
      new Error(
        'Falta VITE_GOOGLE_MAPS_API_KEY. Agregala a tu .env para usar el autocompletado de direcciones.',
      ),
    )
  }
  if (!placesLibraryPromise) {
    placesLibraryPromise = importLibrary('places')
  }
  return placesLibraryPromise
}
