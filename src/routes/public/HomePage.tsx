import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const SPORTS = ['Fútbol', 'Beach Fútbol', 'Beach Vóley', 'Beach Tenis', 'Tenis', 'Pádel']

const CLIENT_STEPS = [
  {
    title: 'Encontrá una cancha cerca tuyo',
    body: 'Vemos tu ubicación y te mostramos los complejos más cercanos, con sus canchas y deportes disponibles.',
  },
  {
    title: 'Reservá o sumate a un partido',
    body: 'Elegí un horario libre y reservá vos solo, o unite a un partido abierto que ya armó otro grupo.',
  },
  {
    title: 'Jugá',
    body: 'Llegá a la cancha a la hora reservada. Así de simple.',
  },
]

export function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between p-4">
        <span className="text-lg font-extrabold tracking-tight">Complejo Deportivo</span>
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Ingresar</Link>
        </Button>
      </header>

      <main className="flex flex-col gap-16 px-4 pb-16 pt-4">
        {/* Hero */}
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium text-primary">
            {SPORTS.join(' · ')}
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Reservá tu cancha o sumate a un partido cerca tuyo
          </h1>
          <p className="text-muted-foreground">
            Encontrá complejos deportivos cercanos, reservá 1 hora de juego, o unite a un partido
            abierto en segundos. Todo desde el celular.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link to="/signup">Crear cuenta y buscar canchas</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full">
              <Link to="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Cómo funciona</h2>
          <div className="flex flex-col gap-3">
            {CLIENT_STEPS.map((step, i) => (
              <Card key={step.title}>
                <CardContent className="flex gap-4 p-4">
                  <span className="text-2xl font-extrabold text-primary">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Deportes */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Todos tus deportes, un solo lugar</h2>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((sport) => (
              <span
                key={sport}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
              >
                {sport}
              </span>
            ))}
          </div>
        </section>

        {/* Para dueños de complejos */}
        <section>
          <Card className="border-primary/30 bg-card">
            <CardContent className="flex flex-col gap-4 p-6">
              <p className="text-sm font-semibold text-primary">Para dueños de complejos</p>
              <h2 className="text-2xl font-bold">
                Gestioná tus canchas, horarios y reservas online
              </h2>
              <p className="text-muted-foreground">
                Registrá tu complejo gratis, cargá tus canchas y empezá a recibir reservas de
                jugadores que buscan dónde jugar cerca de tu zona. Vos controlás precios, horarios
                y disponibilidad en todo momento.
              </p>
              <Button asChild size="lg" className="w-full sm:w-fit">
                <Link to="/register-complex">Registrar mi complejo</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
