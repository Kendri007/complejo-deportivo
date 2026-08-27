import { useEffect, useState } from 'react'

type GeoState =
  | { status: 'loading' }
  | { status: 'success'; lat: number; lng: number }
  | { status: 'error'; message: string }

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: 'loading' })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'Tu navegador no soporta geolocalización.' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        setState({
          status: 'error',
          message:
            error.code === error.PERMISSION_DENIED
              ? 'No nos diste permiso para ver tu ubicación. Activalo para ver complejos cerca tuyo.'
              : 'No pudimos obtener tu ubicación. Intentá de nuevo.',
        })
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    )
  }, [])

  return state
}
