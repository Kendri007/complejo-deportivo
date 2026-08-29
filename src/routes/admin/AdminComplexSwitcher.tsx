import { ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthProvider'
import { useComplexes, useMyManagedComplexes } from '@/features/complexes/hooks'

export function AdminComplexSwitcher() {
  const { complexId } = useParams<{ complexId: string }>()
  const navigate = useNavigate()
  const { role } = useAuth()
  const isSuperAdmin = role === 'super_admin'

  const allComplexes = useComplexes()
  const myComplexes = useMyManagedComplexes()
  const { data: complexes } = isSuperAdmin ? allComplexes : myComplexes

  const current = complexes?.find((c) => c.id === complexId)

  function switchTo(newComplexId: string) {
    // conserva la sub-pantalla actual (courts/schedule/etc.) al cambiar de complejo
    const suffix = complexId ? window.location.pathname.split(complexId)[1] || '' : ''
    navigate(`/admin/${newComplexId}${suffix}`)
  }

  if (!complexes || complexes.length <= 1) {
    return <span className="font-semibold">{current?.name ?? 'Panel de complejo'}</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 font-semibold">
        {current?.name ?? 'Elegir complejo'}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {complexes.map((c) => (
          <DropdownMenuItem key={c.id} onClick={() => switchTo(c.id)}>
            {c.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
