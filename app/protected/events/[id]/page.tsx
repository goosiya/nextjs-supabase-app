import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  CalendarDays,
  MapPin,
  Users,
  Coins,
  ChevronLeft,
  Pencil,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getEventById } from '@/app/actions/events'
import { getParticipants } from '@/app/actions/participants'
import { ParticipantTable } from '@/components/events/participant-table'
import { ShareButton } from '@/components/events/share-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeleteEventButton } from '@/components/events/delete-event-button'

const statusLabel: Record<string, string> = {
  draft: '초안',
  open: '모집중',
  closed: '마감',
  completed: '완료',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventManagePage({ params }: Props) {
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

  const participants = await getParticipants(id)
  const confirmedCount = participants.filter((p) => p.status === 'confirmed').length
  const status = event.status ?? 'open'

  return (
    <div className="w-full space-y-6">
      {/* 상단 내비게이션 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/protected/events">
            <ChevronLeft size={16} />내 모임
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/protected/events/${id}/attendance`}>
              <ClipboardCheck size={14} className="mr-1.5" />
              출석 체크
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/protected/events/${id}/edit`}>
              <Pencil size={14} className="mr-1.5" />
              수정
            </Link>
          </Button>
          <DeleteEventButton eventId={id} />
        </div>
      </div>

      {/* 모임 헤더 */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Badge>{statusLabel[status]}</Badge>
        </div>
        <h1 className="text-2xl font-bold">{event.title}</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="participants">
            참여자
            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
              {confirmedCount}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays size={15} className="shrink-0 text-muted-foreground" />
                <span>
                  {format(new Date(event.event_date), 'yyyy년 M월 d일(EEE) HH:mm', {
                    locale: ko,
                  })}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
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
                  <Users size={15} className="text-muted-foreground" />
                  <span>
                    {confirmedCount}
                    {event.max_participants ? `/${event.max_participants}` : ''}명
                  </span>
                </div>
                {event.fee !== null && event.fee > 0 && (
                  <div className="flex items-center gap-3">
                    <Coins size={15} className="text-muted-foreground" />
                    <span>{event.fee.toLocaleString()}원</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">공유 링크</CardTitle>
            </CardHeader>
            <CardContent>
              <ShareButton slug={event.slug} />
              <p className="mt-2 text-xs text-muted-foreground">
                이 링크를 공유하면 누구나 참여 신청할 수 있습니다
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 참여자 탭 */}
        <TabsContent value="participants" className="mt-4">
          <ParticipantTable participants={participants} eventId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
