import Link from 'next/link'
import { Suspense } from 'react'
import { CalendarDays, Link2, ClipboardCheck } from 'lucide-react'
import { AuthButton } from '@/components/auth-button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import { hasEnvVars } from '@/lib/utils'
import { EnvVarWarning } from '@/components/env-var-warning'

const features = [
  {
    icon: CalendarDays,
    title: '모임 생성',
    description: '제목, 날짜, 장소, 참가비를 입력하면 즉시 공유 링크가 생성됩니다.',
  },
  {
    icon: Link2,
    title: '링크로 신청',
    description: '비회원도 이름만 입력하면 참여 신청 가능. 카카오톡으로 링크를 공유하세요.',
  },
  {
    icon: ClipboardCheck,
    title: '출석 체크',
    description: '당일 체크박스로 출석을 간편하게 처리하고 참여자를 한눈에 확인합니다.',
  },
]

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* 내비게이션 */}
      <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-2xl items-center justify-between px-4 text-sm">
          <Link href="/" className="text-lg font-bold">
            모이자
          </Link>
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <div className="flex items-center gap-3">
              <Suspense>
                <AuthButton />
              </Suspense>
              <ThemeSwitcher />
            </div>
          )}
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-3 text-sm font-medium text-primary">모임 관리가 쉬워집니다</p>
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          링크 하나로
          <br />
          모임 공지부터 출석까지
        </h1>
        <p className="mb-8 max-w-md text-base text-muted-foreground">
          수영, 헬스, 친목 모임을 카카오톡 단체 채팅방 대신 모이자로 관리하세요. 비회원도 링크
          하나로 즉시 참여 신청 가능합니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/protected/events">지금 시작하기</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">로그인</Link>
          </Button>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="border-t bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-2xl font-bold">핵심 기능</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border bg-background p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="flex items-center justify-center border-t py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 모이자. All rights reserved.</p>
      </footer>
    </main>
  )
}
