import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getEventById } from '@/app/actions/events'
import { EventForm } from '@/components/events/event-form'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId || userId !== event.host_id) {
    redirect('/protected/events')
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/protected/events/${id}`}>
            <ChevronLeft size={16} />
            돌아가기
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">모임 수정</h1>
        <p className="mt-1 text-sm text-muted-foreground">{event.title}</p>
      </div>

      <EventForm event={event} />
    </div>
  )
}
