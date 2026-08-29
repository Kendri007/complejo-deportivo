import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignupForm } from '@/features/auth/components/SignupForm'

export function SignupPage() {
  const { search } = useLocation()
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link to={`/login${search}`} className="text-primary underline underline-offset-4">
              Ingresá
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
