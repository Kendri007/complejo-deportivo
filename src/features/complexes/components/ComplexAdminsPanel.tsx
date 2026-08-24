import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAddComplexAdmin,
  useComplexAdmins,
  useRemoveComplexAdmin,
} from '@/features/complexes/hooks'

export function ComplexAdminsPanel({ complexId }: { complexId: string }) {
  const { data: admins, isLoading } = useComplexAdmins(complexId)
  const addAdmin = useAddComplexAdmin(complexId)
  const removeAdmin = useRemoveComplexAdmin(complexId)
  const [email, setEmail] = useState('')

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    addAdmin.mutate(email, { onSuccess: () => setEmail('') })
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Admins del complejo</h2>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      {admins && admins.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay admins asignados.</p>
      )}

      <ul className="flex flex-col gap-2">
        {admins?.map((admin) => (
          <li
            key={admin.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <span className="text-sm">{admin.profiles?.full_name ?? 'Sin nombre'}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={removeAdmin.isPending}
              onClick={() => removeAdmin.mutate(admin.id)}
            >
              Quitar
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <Label htmlFor="admin-email">Agregar admin por email</Label>
        <div className="flex gap-2">
          <Input
            id="admin-email"
            type="email"
            required
            placeholder="admin@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={addAdmin.isPending}>
            Agregar
          </Button>
        </div>
        {addAdmin.isError && (
          <p className="text-sm text-destructive">{(addAdmin.error as Error).message}</p>
        )}
      </form>
    </div>
  )
}
