import type { PaymentMethod } from '@/types/database.types'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pago_movil: 'Pago Móvil',
  binance: 'Binance',
  zinli: 'Zinli',
  zelle: 'Zelle',
  efectivo: 'Efectivo',
}
