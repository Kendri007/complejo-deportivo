import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useComplexes } from '@/features/complexes/hooks'
import { usePlatformSettings, useUpdateMonthlyPrice } from '@/features/subscriptions/hooks'
import { subscriptionStatus } from '@/features/subscriptions/utils'

export function DashboardPage() {
  const { data: settings } = usePlatformSettings()
  const updatePrice = useUpdateMonthlyPrice()
  const { data: complexes, isLoading } = useComplexes()
  const [price, setPrice] = useState<number | null>(null)

  function handleSavePrice(e: FormEvent) {
    e.preventDefault()
    if (price === null) return
    updatePrice.mutate(price)
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h1 className="mb-4 text-xl font-bold">Precio de la mensualidad</h1>
        <form onSubmit={handleSavePrice} className="flex gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly-price">Precio por mes (todos los complejos)</Label>
            <Input
              id="monthly-price"
              type="number"
              step="any"
              min={0}
              placeholder={settings ? String(settings.monthly_price) : ''}
              value={price ?? ''}
              onChange={(e) => setPrice(e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <Button type="submit" disabled={updatePrice.isPending} className="self-end">
            Guardar
          </Button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Complejos</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
        <div className="flex flex-col gap-3">
          {complexes?.map((complex) => {
            const status = subscriptionStatus(complex.subscription_expires_at)
            return (
              <Link key={complex.id} to={`/super-admin/complexes/${complex.id}`}>
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <p className="font-semibold">{complex.name}</p>
                    <span className={`text-sm font-medium ${status.tone}`}>{status.label}</span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
