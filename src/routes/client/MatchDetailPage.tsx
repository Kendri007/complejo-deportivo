import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthProvider'
import { useJoinMatch, useLeaveMatch, useMatchDetails, useMatchParticipants } from '@/features/matches/hooks'
import { StubPage } from '@/routes/StubPage'

export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { user } = useAuth()
  const { data: match, isLoading } = useMatchDetails(matchId)
  const { data: participants } = useMatchParticipants(matchId)
  const joinMatch = useJoinMatch(matchId ?? '')
  const leaveMatch = useLeaveMatch(matchId ?? '')

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Cargando...</p>
  }

  if (!match || !matchId) {
    return <StubPage title="Partido no encontrado" />
  }

  const isParticipant = !!participants?.some((p) => p.user_id === user?.id)
  const isFull = match.joined_count >= match.target_players

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-bold">
          {match.sport_label} en {match.complex_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {match.court_name} · {match.date} · {match.start_time.slice(0, 5)}-
          {match.end_time.slice(0, 5)}
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold">
          {match.joined_count}/{match.target_players} jugadores
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {participants?.map((p) => (
            <li key={p.id} className="rounded-lg border border-border p-3 text-sm">
              {p.profile?.full_name ?? 'Jugador'}
            </li>
          ))}
        </ul>
      </div>

      {match.status === 'cancelled' && (
        <p className="text-sm text-destructive">Este partido fue cancelado.</p>
      )}

      {match.status !== 'cancelled' && !isParticipant && (
        <Button size="lg" disabled={isFull || joinMatch.isPending} onClick={() => joinMatch.mutate()}>
          {isFull ? 'Partido completo' : joinMatch.isPending ? 'Uniéndote...' : 'Unirme al partido'}
        </Button>
      )}

      {isParticipant && match.created_by !== user?.id && (
        <Button
          size="lg"
          variant="secondary"
          disabled={leaveMatch.isPending}
          onClick={() => leaveMatch.mutate()}
        >
          {leaveMatch.isPending ? 'Saliendo...' : 'Salir del partido'}
        </Button>
      )}

      {joinMatch.isError && (
        <p className="text-sm text-destructive">{(joinMatch.error as Error).message}</p>
      )}
      {leaveMatch.isError && (
        <p className="text-sm text-destructive">{(leaveMatch.error as Error).message}</p>
      )}
    </div>
  )
}
