import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAddSportToCourt, useRemoveSportFromCourt } from '@/features/courts/hooks'
import type { CourtWithSports } from '@/features/courts/types'
import { useSports } from '@/features/sports/hooks'

export function CourtSportsTags({
  complexId,
  court,
}: {
  complexId: string
  court: CourtWithSports
}) {
  const { data: allSports } = useSports()
  const addSport = useAddSportToCourt(complexId)
  const removeSport = useRemoveSportFromCourt(complexId)

  const taggedIds = new Set(court.court_sports.map((cs) => cs.sport_id))
  const availableToAdd = allSports?.filter((s) => !taggedIds.has(s.id)) ?? []

  return (
    <div className="flex flex-wrap items-center gap-1">
      {court.court_sports.map((cs) => {
        const isPrimary = cs.sport_id === court.sport_id
        return (
          <span
            key={cs.sport_id}
            className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
          >
            {cs.sports?.label}
            {!isPrimary && (
              <button
                type="button"
                title="Quitar este deporte de la cancha"
                disabled={removeSport.isPending}
                onClick={() =>
                  removeSport.mutate({
                    courtId: court.id,
                    sportId: cs.sport_id,
                    primarySportId: court.sport_id,
                  })
                }
              >
                <X className="size-3" />
              </button>
            )}
          </span>
        )
      })}

      {availableToAdd.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs">
              + Deporte
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {availableToAdd.map((sport) => (
              <DropdownMenuItem
                key={sport.id}
                onClick={() => addSport.mutate({ courtId: court.id, sportId: sport.id })}
              >
                {sport.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
