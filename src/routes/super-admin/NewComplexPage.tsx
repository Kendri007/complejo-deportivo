import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComplexForm } from '@/features/complexes/components/ComplexForm'
import { useCreateComplex } from '@/features/complexes/hooks'

export function NewComplexPage() {
  const navigate = useNavigate()
  const createComplex = useCreateComplex()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Nuevo complejo</h1>
      <ComplexForm
        submitLabel="Crear complejo"
        submitting={createComplex.isPending}
        error={error}
        onSubmit={(values) => {
          setError(null)
          createComplex.mutate(values, {
            onSuccess: (complex) => navigate(`/super-admin/complexes/${complex.id}`),
            onError: (err) => setError((err as Error).message),
          })
        }}
      />
    </div>
  )
}
