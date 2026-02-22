import { EnvVarWarning } from '@/components/env-var-warning'
import { AuthButton } from '@/components/auth-button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { hasEnvVars } from '@/lib/utils'
import Link from 'next/link'
import { Suspense } from 'react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-8">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-2xl items-center justify-between p-3 px-4 text-sm">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/" className="text-base font-bold">
                모이자
              </Link>
              <Link
                href="/protected/events"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                내 모임
              </Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <div className="flex flex-shrink-0 items-center gap-2">
                <Suspense>
                  <AuthButton />
                </Suspense>
                <ThemeSwitcher />
              </div>
            )}
          </div>
        </nav>
        <div className="flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-6">{children}</div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-8 text-center text-xs text-muted-foreground">
          <p>© 2026 모이자</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  )
}
