import type { PropsWithChildren } from 'react'
import { Image } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { LoginBackdrop } from './LoginBackdrop'
import '../login.css'

type AuthLayoutProps = PropsWithChildren<{
  title: string
  description: string
}>

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="login-page relative isolate grid min-h-dvh place-items-center bg-background px-4 py-8 font-sans">
      <LoginBackdrop />
      <Card className="relative w-full max-w-(--login-card-width) gap-9 py-7 shadow-lg ring-border sm:[--card-spacing:--spacing(7)]">
        <CardHeader className="justify-items-center gap-2 text-center">
          <div className="login-logo mb-5 flex items-center gap-3" aria-hidden="true">
            <span className="grid size-15 place-items-center rounded-xl border border-border bg-accent text-accent-foreground shadow-sm">
              <Image className="size-7" strokeWidth={1.5} />
            </span>
          </div>
          <h1 className="text-[1.75rem] leading-tight font-semibold">{title}</h1>
          <CardDescription className="text-secondary-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  )
}
