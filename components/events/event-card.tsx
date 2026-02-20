import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarDays, MapPin, Users, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/types/database.types'

type Event = Tables<'events'>

const statusLabel: Record<string, string> = {
  draft: '초안',
  open: '모집중',
  closed: '마감',
  completed: '완료',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  open: 'default',
  closed: 'outline',
  completed: 'secondary',
}

interface EventCardProps {
  event: Event
  participantCount?: number
}

export function EventCard({ event, participantCount }: EventCardProps) {
  const status = event.status ?? 'open'

  return (
    <Link href={`/protected/events/${event.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
            <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <span>
              {format(new Date(event.event_date), 'yyyy.MM.dd(EEE) HH:mm', { locale: ko })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-4">
            {event.fee !== null && event.fee > 0 && (
              <div className="flex items-center gap-2">
                <Coins size={14} />
                <span>{event.fee.toLocaleString()}원</span>
              </div>
            )}
            {participantCount !== undefined && (
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>
                  {participantCount}
                  {event.max_participants ? `/${event.max_participants}` : ''}명
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
