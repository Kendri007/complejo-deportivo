import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthProvider'
import { signUpWithPassword } from '@/features/auth/api'
import { useRegisterComplex } from '@/features/complexes/hooks'
import { AddressAutocomplete } from '@/features/geolocation/components/AddressAutocomplete'

export function RegisterComplexPage() {
  const navigate = useNavigate()
  const { session, user, refreshProfile } = useAuth()
  const registerComplex = useRegisterComplex()
  const alreadyLoggedIn = !!session

  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [complexName, setComplexName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (!alreadyLoggedIn) {
      const { data, error: signUpError } = await signUpWithPassword(email, password, ownerName)
      if (signUpError) {
        setSubmitting(false)
        setError(
          signUpError.message.toLowerCase().includes('already registered')
            ? 'Ese email ya tiene una cuenta. Iniciá sesión y volvé a esta página para registrar tu complejo con esa cuenta.'
            : signUpError.message,
        )
        return
      }
      if (!data.session) {
        setSubmitting(false)
        setError(
          'Te enviamos un email para confirmar tu cuenta. Confirmá y volvé a intentar registrar tu complejo.',
        )
        return
      }
    }

    registerComplex.mutate(
      {
        name: complexName,
        address: address || null,
        phone: phone || null,
        lat,
        lng,
      },
      {
        onSuccess: async (complexId) => {
          await refreshProfile()
          navigate(`/admin/${complexId}/courts`)
        },
        onError: (err) => {
          setSubmitting(false)
          setError((err as Error).message)
        },
      },
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Registrá tu complejo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {alreadyLoggedIn ? (
              <p className="text-sm text-muted-foreground">
                Vas a registrar este complejo con tu cuenta actual ({user?.email}).
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">Tu cuenta</p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ownerName">Tu nombre</Label>
                  <Input
                    id="ownerName"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            <p className="mt-2 text-sm font-semibold text-muted-foreground">Tu complejo</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="complexName">Nombre del complejo</Label>
              <Input
                id="complexName"
                required
                value={complexName}
                onChange={(e) => setComplexName(e.target.value)}
              />
            </div>
            <AddressAutocomplete
              id="address"
              label="Dirección"
              value={address}
              onChange={setAddress}
              onPlaceSelected={(place) => {
                setAddress(place.address)
                setLat(place.lat)
                setLng(place.lng)
              }}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Registrando...' : 'Registrar mi complejo'}
            </Button>

            {!alreadyLoggedIn && (
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" className="text-primary underline underline-offset-4">
                  Ingresá
                </Link>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
