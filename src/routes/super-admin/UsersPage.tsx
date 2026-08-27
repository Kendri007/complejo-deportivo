import { Card, CardContent } from '@/components/ui/card'
import { useAllUsers } from '@/features/users/hooks'

const ROLE_LABELS = {
  client: 'Cliente',
  complex_admin: 'Admin de complejo',
  super_admin: 'Super admin',
}

export function UsersPage() {
  const { data: users, isLoading } = useAllUsers()

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Usuarios</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      <div className="flex flex-col gap-3">
        {users?.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{u.full_name ?? 'Sin nombre'}</p>
                <p className="text-sm text-muted-foreground">{u.phone ?? 'Sin teléfono'}</p>
              </div>
              <span className="text-sm font-medium text-primary">{ROLE_LABELS[u.role]}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
