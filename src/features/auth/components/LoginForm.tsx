import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchUserRole, homeRouteForRole, signInWithGoogle, signInWithPassword } from '@/features/auth/api'

export function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const explicitRedirect = searchParams.get('redirect')
  const redirectTo = explicitRedirect || '/app'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data, error } = await signInWithPassword(email, password)
    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    // Si no venía de un link específico (ej. "reservá esta cancha"), a un
    // admin/super-admin lo mandamos directo a su panel en vez de a la vista
    // de cliente genérica — es lo que va a usar en el 99% de los casos.
    if (!explicitRedirect && data.session) {
      const role = await fetchUserRole(data.session.user.id)
      setLoading(false)
      navigate(homeRouteForRole(role))
      return
    }

    setLoading(false)
    navigate(redirectTo)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => signInWithGoogle(redirectTo)}
      >
        Continuar con Google
      </Button>
    </form>
  )
}
