import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <header className="flex items-center justify-between pt-2">
        <span className="text-lg font-extrabold tracking-tight">Complejo Deportivo</span>
      </header>

      <main className="flex flex-col gap-3">
        <p className="text-sm font-medium text-primary">Fútbol · Beach · Tenis · Pádel</p>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
          Reservá tu cancha o sumate a un partido cerca tuyo
        </h1>
        <p className="text-muted-foreground">
          Encontrá complejos deportivos cercanos, reservá 1 hora de juego, o unite a un partido
          abierto en segundos.
        </p>
      </main>

      <footer className="flex flex-col gap-3 pb-2">
        <Button asChild size="lg" className="w-full">
          <Link to="/signup">Crear cuenta</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link to="/login">Ya tengo cuenta</Link>
        </Button>
      </footer>
    </div>
  )
}
