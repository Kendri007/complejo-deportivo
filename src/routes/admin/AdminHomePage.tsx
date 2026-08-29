import { Link, Navigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthProvider'
import { useComplexes, useMyManagedComplexes } from '@/features/complexes/hooks'

export function AdminHomePage() {
  const { role } = useAuth()
  const isSuperAdmin = role === 'super_admin'
  const allComplexes = useComplexes()
  const myComplexes = useMyManagedComplexes()

  const { data: complexes, isLoading } = isSuperAdmin ? allComplexes : myComplexes

  // Con un solo complejo (el caso más común) salteamos el selector y vamos
  // directo al dashboard, en vez de mostrar una lista de una sola tarjeta.
  if (!isSuperAdmin && complexes && complexes.length === 1) {
    return <Navigate to={`/admin/${complexes[0].id}`} replace />
  }

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
          <Link key={complex.id} to={`/admin/${complex.id}`}>
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
