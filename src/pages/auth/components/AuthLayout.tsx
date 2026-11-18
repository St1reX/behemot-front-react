import type { PropsWithChildren } from 'react'
import behemotLogo from '@/assets/images/behemot-logo.jpeg'
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
          <div className="login-logo mb-5 flex items-center gap-3">
            <img
              src={behemotLogo}
              alt="Behemot"
              width={80}
              height={80}
              className="size-20 rounded-2xl object-cover shadow-sm ring-1 ring-foreground/10"
            />
          </div>
          <h1 className="text-[1.75rem] leading-tight font-semibold">{title}</h1>
          <CardDescription className="text-secondary-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  )
}
