import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarDays, MapPin, Users, Coins, ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEventBySlug } from '@/app/actions/events'
import { getParticipants } from '@/app/actions/participants'
import { JoinForm } from '@/components/events/join-form'
import { ShareButton } from '@/components/events/share-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const statusLabel: Record<string, string> = {
  draft: '초안',
  open: '모집중',
  closed: '마감',
  completed: '완료',
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EventPublicPage({ params }: Props) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub ?? null
  const isHost = userId === event.host_id

  const participants = await getParticipants(event.id)
  const confirmedCount = participants.filter((p) => p.status === 'confirmed').length

  const status = event.status ?? 'open'
  const isFull = event.max_participants !== null && confirmedCount >= event.max_participants
  const canJoin = status === 'open' && !isFull

  // 로그인 사용자의 프로필 이름
  let defaultName: string | undefined
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    defaultName = profile?.full_name ?? undefined
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between gap-2">
        <div>
          <Badge className="mb-2">{statusLabel[status]}</Badge>
          <h1 className="text-2xl font-bold">{event.title}</h1>
        </div>
        {isHost && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/protected/events/${event.id}`}>
              <Settings size={14} className="mr-1.5" />
              관리
            </Link>
          </Button>
        )}
      </div>

      {/* 모임 정보 */}
      <Card className="mb-6">
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays size={16} className="shrink-0 text-muted-foreground" />
            <span>
              {format(new Date(event.event_date), 'yyyy년 M월 d일(EEE) HH:mm', { locale: ko })}
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <span>{event.location}</span>
              {event.location_url && (
                <a
                  href={event.location_url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  지도 <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Users size={16} className="text-muted-foreground" />
              <span>
                {confirmedCount}
                {event.max_participants ? `/${event.max_participants}` : ''}명 참여
              </span>
            </div>
            {event.fee !== null && event.fee > 0 && (
              <div className="flex items-center gap-3">
                <Coins size={16} className="text-muted-foreground" />
                <span>{event.fee.toLocaleString()}원</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 설명 */}
      {event.description && (
        <div className="mb-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        </div>
      )}

      <Separator className="mb-6" />

      {/* 공유 링크 */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-muted-foreground">공유 링크</p>
        <ShareButton slug={slug} />
      </div>

      {/* 참여 신청 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {canJoin ? '참여 신청' : isFull ? '정원이 마감되었습니다' : '모집이 종료되었습니다'}
          </CardTitle>
        </CardHeader>
        {canJoin && (
          <CardContent>
            <JoinForm eventId={event.id} defaultName={defaultName} />
          </CardContent>
        )}
      </Card>
    </main>
  )
}
