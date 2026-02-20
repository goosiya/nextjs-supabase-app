'use client'

import { useTransition } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateParticipantStatus } from '@/app/actions/participants'
import type { Tables } from '@/types/database.types'

type Participant = Tables<'event_participants'>

const statusLabel: Record<string, string> = {
  pending: '대기',
  confirmed: '확정',
  cancelled: '취소',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
}

interface ParticipantTableProps {
  participants: Participant[]
  eventId: string
}

export function ParticipantTable({ participants, eventId }: ParticipantTableProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateParticipantStatus(id, status, eventId)
    })
  }

  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        아직 참여자가 없습니다
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>신청일</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p) => {
            const status = p.status ?? 'confirmed'
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.guest_name ?? '-'}</TableCell>
                <TableCell>{p.guest_phone ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.created_at
                    ? format(new Date(p.created_at), 'MM.dd HH:mm', { locale: ko })
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {status !== 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleStatusChange(p.id, 'confirmed')}
                      >
                        확정
                      </Button>
                    )}
                    {status !== 'cancelled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleStatusChange(p.id, 'cancelled')}
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
