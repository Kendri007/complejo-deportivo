import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { AdminSidebar } from '@/routes/admin/AdminSidebar'
import { AdminComplexSwitcher } from '@/routes/admin/AdminComplexSwitcher'

export function AdminLayout() {
  const { complexId } = useParams<{ complexId: string }>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      {complexId && (
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card/40 md:block">
          <AdminSidebar complexId={complexId} />
        </aside>
      )}

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border p-4">
          {complexId && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          )}
          {complexId ? (
            <AdminComplexSwitcher />
          ) : (
            <span className="font-bold">Panel de complejo</span>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {complexId && (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <AdminSidebar complexId={complexId} onNavigate={() => setDrawerOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
