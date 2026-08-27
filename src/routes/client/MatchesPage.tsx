import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useOpenMatches } from '@/features/matches/hooks'

export function MatchesPage() {
  const { data: matches, isLoading } = useOpenMatches()

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Partidos abiertos</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {matches && matches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay partidos abiertos ahora. ¡Creá uno vos reservando una cancha!
        </p>
      )}

      <div className="flex flex-col gap-3">
        {matches?.map((match) => (
          <Link key={match.match_id} to={`/app/matches/${match.match_id}`}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">
                    {match.sport_label} · {match.complex_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {match.court_name} · {match.date} · {match.start_time.slice(0, 5)}-
                    {match.end_time.slice(0, 5)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {match.joined_count}/{match.target_players}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
