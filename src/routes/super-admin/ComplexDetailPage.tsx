import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ComplexForm } from '@/features/complexes/components/ComplexForm'
import { ComplexAdminsPanel } from '@/features/complexes/components/ComplexAdminsPanel'
import { useComplex, useDeleteComplex, useUpdateComplex } from '@/features/complexes/hooks'
import { SubscriptionPanel } from '@/features/subscriptions/components/SubscriptionPanel'
import { StubPage } from '@/routes/StubPage'

export function ComplexDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: complex, isLoading } = useComplex(id)
  const updateComplex = useUpdateComplex(id ?? '')
  const deleteComplex = useDeleteComplex()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Cargando...</p>
  }

  if (!complex || !id) {
    return <StubPage title="Complejo no encontrado" />
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h1 className="mb-4 text-xl font-bold">{complex.name}</h1>
        <ComplexForm
          initialValues={complex}
          submitLabel="Guardar cambios"
          submitting={updateComplex.isPending}
          error={error}
          onSubmit={(values) => {
            setError(null)
            updateComplex.mutate(values, {
              onError: (err) => setError((err as Error).message),
            })
          }}
        />
      </div>

      <ComplexAdminsPanel complexId={id} />

      <SubscriptionPanel
        complexId={id}
        subscriptionExpiresAt={complex.subscription_expires_at}
      />

      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          if (!window.confirm(`¿Eliminar "${complex.name}"? Esta acción no se puede deshacer.`)) {
            return
          }
          deleteComplex.mutate(id, { onSuccess: () => navigate('/super-admin/complexes') })
        }}
        disabled={deleteComplex.isPending}
      >
        Eliminar complejo
      </Button>
    </div>
  )
}
