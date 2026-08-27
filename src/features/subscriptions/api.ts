import { supabase } from '@/lib/supabase'

export async function getPlatformSettings() {
  const { data, error } = await supabase.from('platform_settings').select('*').single()
  if (error) throw error
  return data
}

export async function updateMonthlyPrice(price: number) {
  const { error } = await supabase
    .from('platform_settings')
    .update({ monthly_price: price })
    .eq('id', true)
  if (error) throw error
}

export async function listSubscriptionPayments(complexId: string) {
  const { data, error } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('complex_id', complexId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function recordSubscriptionPayment(input: {
  complexId: string
  amount: number
  months: number
}) {
  const { data, error } = await supabase.rpc('record_subscription_payment', {
    target_complex_id: input.complexId,
    amount: input.amount,
    months: input.months,
  })
  if (error) throw error
  return data
}
