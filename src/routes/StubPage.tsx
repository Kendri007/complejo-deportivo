export function StubPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-muted-foreground">Próximamente</p>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  )
}
