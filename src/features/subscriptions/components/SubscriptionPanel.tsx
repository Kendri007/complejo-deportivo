import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  usePlatformSettings,
  useRecordSubscriptionPayment,
  useSubscriptionPayments,
} from '@/features/subscriptions/hooks'
import { subscriptionStatus } from '@/features/subscriptions/utils'

export function SubscriptionPanel({
  complexId,
  subscriptionExpiresAt,
}: {
  complexId: string
  subscriptionExpiresAt: string | null
}) {
  const { data: settings } = usePlatformSettings()
  const { data: payments, isLoading } = useSubscriptionPayments(complexId)
  const recordPayment = useRecordSubscriptionPayment(complexId)

  const [months, setMonths] = useState(1)
  const [amount, setAmount] = useState<number | null>(null)

  const defaultAmount = (settings?.monthly_price ?? 0) * months
  const status = subscriptionStatus(subscriptionExpiresAt)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    recordPayment.mutate({ amount: amount ?? defaultAmount, months })
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Suscripción</h2>
      <p className={`text-sm font-medium ${status.tone}`}>{status.label}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="months">Meses</Label>
            <Input
              id="months"
              type="number"
              min={1}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value) || 1)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              min={0}
              placeholder={String(defaultAmount)}
              value={amount ?? ''}
              onChange={(e) => setAmount(e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
        </div>
        {recordPayment.isError && (
          <p className="text-sm text-destructive">{(recordPayment.error as Error).message}</p>
        )}
        <Button type="submit" disabled={recordPayment.isPending}>
          {recordPayment.isPending ? 'Registrando...' : 'Registrar pago'}
        </Button>
      </form>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando pagos...</p>}
      {payments && payments.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin pagos registrados todavía.</p>
      )}
      <ul className="flex flex-col gap-2">
        {payments?.map((p) => (
          <li key={p.id} className="rounded-lg border border-border p-3 text-sm">
            <span className="font-medium">${p.amount}</span> · {p.months} mes(es) · {p.period_start}{' '}
            a {p.period_end}
          </li>
        ))}
      </ul>
    </div>
  )
}
