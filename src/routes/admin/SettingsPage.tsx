import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ComplexForm } from '@/features/complexes/components/ComplexForm'
import { useComplex, useUpdateComplex } from '@/features/complexes/hooks'
import { SubscriptionPanel } from '@/features/subscriptions/components/SubscriptionPanel'
import { StubPage } from '@/routes/StubPage'

export function SettingsPage() {
  const { complexId } = useParams<{ complexId: string }>()
  const { data: complex, isLoading } = useComplex(complexId)
  const updateComplex = useUpdateComplex(complexId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Cargando...</p>
  }

  if (!complex || !complexId) {
    return <StubPage title="Complejo no encontrado" />
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h1 className="mb-4 text-xl font-bold">Configuración</h1>
        <ComplexForm
          complexId={complexId}
          initialValues={complex}
          submitLabel={saved ? 'Guardado' : 'Guardar cambios'}
          submitting={updateComplex.isPending}
          error={error}
          onSubmit={(values) => {
            setError(null)
            setSaved(false)
            updateComplex.mutate(values, {
              onSuccess: () => setSaved(true),
              onError: (err) => setError((err as Error).message),
            })
          }}
        />
      </div>

      <SubscriptionPanel
        complexId={complexId}
        subscriptionExpiresAt={complex.subscription_expires_at}
        canRecordPayment={false}
      />
    </div>
  )
}
