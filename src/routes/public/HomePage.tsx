import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFeaturedComplexes } from '@/features/complexes/hooks'

const SPORTS = ['Fútbol', 'Beach Vóley', 'Beach Tenis', 'Tenis', 'Pádel']

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
  const { data: featuredComplexes, isLoading: loadingFeatured } = useFeaturedComplexes()
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between p-4">
          <span className="text-lg font-extrabold tracking-tight">Complejo Deportivo</span>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Ingresar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-xl flex-col gap-4">
            <p className="text-sm font-medium text-primary">{SPORTS.join(' · ')}</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Reservá tu cancha o sumate a un partido cerca tuyo
            </h1>
            <p className="text-muted-foreground">
              Encontrá complejos deportivos cercanos, reservá 1 hora de juego, o unite a un
              partido abierto en segundos. Todo desde el celular.
            </p>
            <div className="mt-2 flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link to="/signup">Crear cuenta y buscar canchas</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link to="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Complejos en la plataforma */}
        {(loadingFeatured || (featuredComplexes && featuredComplexes.length > 0)) && (
          <section className="border-y border-border bg-card/30 px-4 py-16">
            <div className="mx-auto flex max-w-xl flex-col gap-4">
              <h2 className="text-2xl font-bold">Complejos en la plataforma</h2>
              {loadingFeatured && <p className="text-sm text-muted-foreground">Cargando...</p>}
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
                {featuredComplexes?.map((complex) => (
                  <Link key={complex.id} to={`/app/complexes/${complex.id}`} className="shrink-0">
                    <Card className="w-64 overflow-hidden">
                      <div
                        className="h-32 w-full bg-cover bg-center bg-muted"
                        style={
                          complex.cover_image_url
                            ? { backgroundImage: `url(${complex.cover_image_url})` }
                            : undefined
                        }
                      />
                      <CardContent className="p-4">
                        <p className="font-semibold">{complex.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {complex.address}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cómo funciona */}
        <section className="px-4 py-16">
          <div className="mx-auto flex max-w-xl flex-col gap-4">
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
          </div>
        </section>

        {/* Deportes */}
        <section className="border-y border-border bg-card/30 px-4 py-16">
          <div className="mx-auto flex max-w-xl flex-col gap-4">
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
          </div>
        </section>

        {/* Para dueños de complejos */}
        <section className="bg-primary/5 px-4 py-16">
          <div className="mx-auto max-w-xl">
            <Card className="border-primary/30 bg-card">
              <CardContent className="flex flex-col gap-4 p-6">
                <p className="text-sm font-semibold text-primary">Para dueños de complejos</p>
                <h2 className="text-2xl font-bold">
                  Gestioná tus canchas, horarios y reservas online
                </h2>
                <p className="text-muted-foreground">
                  Registrá tu complejo gratis, cargá tus canchas y empezá a recibir reservas de
                  jugadores que buscan dónde jugar cerca de tu zona. Vos controlás precios,
                  horarios y disponibilidad en todo momento.
                </p>
                <Button asChild size="lg" className="w-full sm:w-fit">
                  <Link to="/register-complex">Registrar mi complejo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-10">
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Jugadores</p>
              <Link to="/signup" className="text-sm text-muted-foreground">
                Crear cuenta
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground">
                Ingresar
              </Link>
              <Link to="/app/matches" className="text-sm text-muted-foreground">
                Partidos abiertos
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Complejos</p>
              <Link to="/register-complex" className="text-sm text-muted-foreground">
                Registrar mi complejo
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground">
                Panel de administración
              </Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {year} Complejo Deportivo. Fútbol, beach vóley, beach tenis, tenis y pádel en un
            solo lugar.
          </p>
        </div>
      </footer>
    </div>
  )
}
