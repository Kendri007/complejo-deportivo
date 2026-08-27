import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CourtForm, type CourtFormValues } from '@/features/courts/components/CourtForm'
import { useCourts, useCreateCourt, useDeleteCourt, useUpdateCourt } from '@/features/courts/hooks'
import { useSportByKey } from '@/features/sports/hooks'

export function CourtsPage() {
  const { complexId } = useParams<{ complexId: string }>()
  const { data: padel } = useSportByKey('padel')
  const { data: courts, isLoading } = useCourts(complexId, padel?.id)
  const createCourt = useCreateCourt(complexId ?? '', padel?.id ?? '')
  const updateCourt = useUpdateCourt(complexId ?? '', padel?.id ?? '')
  const deleteCourt = useDeleteCourt(complexId ?? '', padel?.id ?? '')

  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!complexId) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Canchas de pádel</h1>
        {!showNewForm && (
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            Nueva cancha
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      {showNewForm && padel && (
        <CourtForm
          submitLabel="Crear cancha"
          submitting={createCourt.isPending}
          error={error}
          onCancel={() => setShowNewForm(false)}
          onSubmit={(values) => {
            setError(null)
            createCourt.mutate(
              { complex_id: complexId, sport_id: padel.id, ...values },
              {
                onSuccess: () => setShowNewForm(false),
                onError: (err) => setError((err as Error).message),
              },
            )
          }}
        />
      )}

      {courts && courts.length === 0 && !showNewForm && (
        <p className="text-sm text-muted-foreground">Todavía no cargaste ninguna cancha.</p>
      )}

      <div className="flex flex-col gap-3">
        {courts?.map((court) =>
          editingId === court.id ? (
            <CourtForm
              key={court.id}
              initialValues={court}
              submitLabel="Guardar cambios"
              submitting={updateCourt.isPending}
              error={error}
              onCancel={() => setEditingId(null)}
              onSubmit={(values: CourtFormValues) => {
                setError(null)
                updateCourt.mutate(
                  { id: court.id, patch: values },
                  {
                    onSuccess: () => setEditingId(null),
                    onError: (err) => setError((err as Error).message),
                  },
                )
              }}
            />
          ) : (
            <div
              key={court.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-semibold">{court.name}</p>
                <p className="text-sm text-muted-foreground">
                  {court.surface || 'Sin superficie'} · {court.is_active ? 'Activa' : 'Inactiva'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link to={`/admin/${complexId}/schedule?courtId=${court.id}`}>Horarios</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingId(court.id)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleteCourt.isPending}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar "${court.name}"?`)) {
                      deleteCourt.mutate(court.id)
                    }
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
