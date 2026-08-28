import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthProvider'
import { signOut } from '@/features/auth/api'
import { useUpdateMyProfile } from '@/features/profile/hooks'

const ROLE_LABELS = {
  client: 'Cliente',
  complex_admin: 'Admin de complejo',
  super_admin: 'Super admin',
}

export function ProfilePage() {
  const { user, profile } = useAuth()
  const updateProfile = useUpdateMyProfile()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
  }, [profile])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaved(false)
    updateProfile.mutate(
      { full_name: fullName, phone: phone || null },
      { onSuccess: () => setSaved(true) },
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {profile && (
          <p className="text-sm text-primary">{ROLE_LABELS[profile.role]}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        {updateProfile.isError && (
          <p className="text-sm text-destructive">{(updateProfile.error as Error).message}</p>
        )}
        {saved && <p className="text-sm text-primary">Guardado.</p>}

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>

      {(profile?.role === 'complex_admin' || profile?.role === 'super_admin') && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-muted-foreground">Paneles de gestión</p>
          <Button asChild variant="secondary">
            <Link to="/admin">Ir al panel de complejos</Link>
          </Button>
          {profile.role === 'super_admin' && (
            <Button asChild variant="secondary">
              <Link to="/super-admin">Ir al panel de super-admin</Link>
            </Button>
          )}
        </div>
      )}

      <Button variant="secondary" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </div>
  )
}
