export function subscriptionStatus(expiresAt: string | null) {
  if (!expiresAt) return { label: 'Sin seguimiento', tone: 'text-muted-foreground' }
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)} día(s)`, tone: 'text-destructive' }
  if (days <= 7) return { label: `Vence en ${days} día(s)`, tone: 'text-accent' }
  return { label: `Vigente hasta ${expiresAt}`, tone: 'text-primary' }
}
