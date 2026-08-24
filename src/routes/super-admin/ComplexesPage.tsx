import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useComplexes } from '@/features/complexes/hooks'

export function ComplexesPage() {
  const { data: complexes, isLoading } = useComplexes()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Complejos</h1>
        <Button asChild size="sm">
          <Link to="/super-admin/complexes/new">Nuevo complejo</Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      {complexes && complexes.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no creaste ningún complejo.</p>
      )}

      <div className="flex flex-col gap-3">
        {complexes?.map((complex) => (
          <Link key={complex.id} to={`/super-admin/complexes/${complex.id}`}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{complex.name}</p>
                  <p className="text-sm text-muted-foreground">{complex.address}</p>
                </div>
                {!complex.is_active && (
                  <span className="text-xs text-muted-foreground">Inactivo</span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
