import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { OperatingHoursEditor } from '@/features/schedule/components/OperatingHoursEditor'
import { BlackoutDatesPanel } from '@/features/schedule/components/BlackoutDatesPanel'
import { useAllCourts } from '@/features/courts/hooks'

export function SchedulePage() {
  const { complexId } = useParams<{ complexId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: courts, isLoading } = useAllCourts(complexId)

  const courtId = searchParams.get('courtId') ?? courts?.[0]?.id

  useEffect(() => {
    if (!searchParams.get('courtId') && courts && courts.length > 0) {
      setSearchParams({ courtId: courts[0].id }, { replace: true })
    }
  }, [courts, searchParams, setSearchParams])

  if (!complexId) return null

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Cargando...</p>
  }

  if (!courts || courts.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Primero cargá una cancha para poder configurar sus horarios.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Horarios</h1>
        <div className="flex flex-wrap gap-2">
          {courts.map((court) => (
            <button
              key={court.id}
              type="button"
              onClick={() => setSearchParams({ courtId: court.id })}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                court.id === courtId
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground'
              }`}
            >
              {court.name} · {court.sports?.label}
            </button>
          ))}
        </div>
      </div>

      {courtId && (
        <>
          <section>
            <h2 className="mb-3 text-lg font-bold">Horario de atención</h2>
            <OperatingHoursEditor courtId={courtId} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Fechas bloqueadas</h2>
            <BlackoutDatesPanel complexId={complexId} courtId={courtId} />
          </section>
        </>
      )}
    </div>
  )
}
