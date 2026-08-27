import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthProvider'
import { useComplexes, useMyManagedComplexes } from '@/features/complexes/hooks'

export function AdminHomePage() {
  const { role } = useAuth()
  const isSuperAdmin = role === 'super_admin'
  const allComplexes = useComplexes()
  const myComplexes = useMyManagedComplexes()

  const { data: complexes, isLoading } = isSuperAdmin ? allComplexes : myComplexes

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Mis complejos</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      {complexes && complexes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Todavía no administrás ningún complejo.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {complexes?.map((complex) => (
          <Link key={complex.id} to={`/admin/${complex.id}/courts`}>
            <Card>
              <CardContent className="p-4">
                <p className="font-semibold">{complex.name}</p>
                <p className="text-sm text-muted-foreground">{complex.address}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
