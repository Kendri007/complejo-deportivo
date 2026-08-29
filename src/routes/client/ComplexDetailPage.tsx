import { Link, useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useComplex } from '@/features/complexes/hooks'
import { useActiveCourts } from '@/features/courts/hooks'
import { courtSportLabels } from '@/features/courts/types'
import { StubPage } from '@/routes/StubPage'

export function ComplexDetailPage() {
  const { complexId } = useParams<{ complexId: string }>()
  const { data: complex, isLoading: loadingComplex } = useComplex(complexId)
  const { data: courts, isLoading: loadingCourts } = useActiveCourts(complexId)

  if (loadingComplex) {
    return <p className="p-4 text-sm text-muted-foreground">Cargando...</p>
  }

  if (!complex || !complexId) {
    return <StubPage title="Complejo no encontrado" />
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-xl font-bold">{complex.name}</h1>
        <p className="text-sm text-muted-foreground">{complex.address}</p>
        {complex.description && <p className="mt-2 text-sm">{complex.description}</p>}
      </div>

      <h2 className="text-lg font-bold">Canchas</h2>
      {loadingCourts && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {courts && courts.length === 0 && (
        <p className="text-sm text-muted-foreground">Este complejo todavía no cargó canchas.</p>
      )}

      <div className="flex flex-col gap-3">
        {courts?.map((court) => (
          <Link key={court.id} to={`/app/complexes/${complexId}/courts/${court.id}/book`}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{court.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {courtSportLabels(court)} · {court.surface || 'Sin superficie'}
                  </p>
                </div>
                {court.price_per_hour && (
                  <span className="text-sm font-semibold text-primary">
                    ${court.price_per_hour}/h
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
