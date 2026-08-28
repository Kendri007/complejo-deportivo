import { useCallback, useEffect, useState } from 'react'

type GeoState =
  | { status: 'loading' }
  | { status: 'success'; lat: number; lng: number; manual?: boolean }
  | { status: 'error'; message: string }

function messageForError(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'No nos diste permiso para ver tu ubicación. Activalo en el navegador para ver complejos cerca tuyo, o buscá tu dirección manualmente.'
    case error.POSITION_UNAVAILABLE:
      return 'No pudimos obtener tu ubicación (revisá que el servicio de ubicación esté activado en tu dispositivo). Podés buscar tu dirección manualmente.'
    case error.TIMEOUT:
      return 'Obtener tu ubicación tardó demasiado. Probá de nuevo o buscá tu dirección manualmente.'
    default:
      return 'No pudimos obtener tu ubicación. Probá de nuevo o buscá tu dirección manualmente.'
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'Tu navegador no soporta geolocalización.' })
      return
    }
    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        setState({ status: 'error', message: messageForError(error) })
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    )
  }, [attempt])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  const setManualLocation = useCallback((lat: number, lng: number) => {
    setState({ status: 'success', lat, lng, manual: true })
  }, [])

  return { ...state, retry, setManualLocation }
}
