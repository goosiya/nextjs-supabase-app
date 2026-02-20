import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getEventById } from '@/app/actions/events'
import { getParticipants } from '@/app/actions/participants'
import { AttendanceList } from '@/components/events/attendance-list'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AttendancePage({ params }: Props) {
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

  const allParticipants = await getParticipants(id)
  // 확정된 참여자만 출석 체크 대상
  const participants = allParticipants.filter((p) => p.status !== 'cancelled')

  const attendedCount = participants.filter((p) => p.attended).length

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/protected/events/${id}`}>
            <ChevronLeft size={16} />
            모임으로
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">출석 체크</h1>
        <p className="mt-1 text-sm text-muted-foreground">{event.title}</p>
      </div>

      {/* 출석 현황 요약 */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="text-sm font-medium">출석 현황</span>
        <span className="text-lg font-bold">
          {attendedCount}
          <span className="text-sm font-normal text-muted-foreground">
            {' '}
            / {participants.length}명
          </span>
        </span>
      </div>

      <AttendanceList participants={participants} eventId={id} />
    </div>
  )
}
