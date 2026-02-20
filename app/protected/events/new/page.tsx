import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EventForm } from '@/components/events/event-form'
import { Button } from '@/components/ui/button'

export default function NewEventPage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/protected/events">
            <ChevronLeft size={16} />내 모임
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">새 모임 만들기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          모임 정보를 입력하면 공유 링크가 생성됩니다
        </p>
      </div>

      <EventForm />
    </div>
  )
}
