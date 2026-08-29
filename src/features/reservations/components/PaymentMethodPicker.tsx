import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PAYMENT_METHOD_LABELS } from '@/features/reservations/paymentMethods'
import type { PaymentMethod } from '@/types/database.types'

type ComplexPaymentInfo = {
  payment_pago_movil?: string | null
  payment_binance?: string | null
  payment_zinli?: string | null
  payment_zelle?: string | null
}

function instructionsFor(complex: ComplexPaymentInfo, method: PaymentMethod) {
  if (method === 'pago_movil') return complex.payment_pago_movil
  if (method === 'binance') return complex.payment_binance
  if (method === 'zinli') return complex.payment_zinli
  if (method === 'zelle') return complex.payment_zelle
  return null
}

export function PaymentMethodPicker({
  complex,
  method,
  onMethodChange,
  reference,
  onReferenceChange,
}: {
  complex: ComplexPaymentInfo
  method: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  reference: string
  onReferenceChange: (reference: string) => void
}) {
  const availableMethods = (
    ['pago_movil', 'binance', 'zinli', 'zelle', 'efectivo'] as PaymentMethod[]
  ).filter((m) => m === 'efectivo' || instructionsFor(complex, m))

  const instructions = instructionsFor(complex, method)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">¿Cómo vas a pagar?</p>
      <div className="flex flex-wrap gap-2">
        {availableMethods.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMethodChange(m)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              method === m
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground'
            }`}
          >
            {PAYMENT_METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {method === 'efectivo' ? (
        <p className="text-sm text-muted-foreground">Pagás en efectivo cuando llegués a jugar.</p>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <p className="whitespace-pre-line text-sm text-muted-foreground">{instructions}</p>
          <p className="text-xs text-muted-foreground">
            Este pago no se procesa automáticamente: transferí por tu cuenta y el complejo
            confirma tu pago del otro lado.
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment-reference">Referencia de pago (opcional)</Label>
            <Input
              id="payment-reference"
              placeholder="Últimos dígitos, ID de transacción..."
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
