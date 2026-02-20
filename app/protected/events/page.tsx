import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getMyEvents } from '@/app/actions/events'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'

export default async function MyEventsPage() {
  const events = await getMyEvents()

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 모임</h1>
        <Button asChild>
          <Link href="/protected/events/new">
            <Plus size={16} className="mr-1.5" />새 모임 만들기
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">아직 만든 모임이 없습니다</p>
          <Button asChild className="mt-4">
            <Link href="/protected/events/new">첫 모임 만들기</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => {
            const countData = (event as { event_participants: { count: number }[] })
              .event_participants
            const count = Array.isArray(countData) ? (countData[0]?.count ?? 0) : 0
            return <EventCard key={event.id} event={event} participantCount={count} />
          })}
        </div>
      )}
    </div>
  )
}
