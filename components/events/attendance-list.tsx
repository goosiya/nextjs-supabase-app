'use client'

import { useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateAttendance } from '@/app/actions/participants'
import type { Tables } from '@/types/database.types'

type Participant = Tables<'event_participants'>

interface AttendanceListProps {
  participants: Participant[]
  eventId: string
}

export function AttendanceList({ participants, eventId }: AttendanceListProps) {
  const [isPending, startTransition] = useTransition()

  function handleCheck(id: string, checked: boolean) {
    startTransition(async () => {
      await updateAttendance(id, checked, eventId)
    })
  }

  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        확정된 참여자가 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {participants.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <Checkbox
            id={p.id}
            checked={p.attended ?? false}
            disabled={isPending}
            onCheckedChange={(checked) => handleCheck(p.id, !!checked)}
          />
          <Label
            htmlFor={p.id}
            className="flex-1 cursor-pointer font-medium"
            style={{ opacity: p.attended ? 1 : 0.6 }}
          >
            {p.guest_name ?? '이름 없음'}
            {p.guest_phone && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {p.guest_phone}
              </span>
            )}
          </Label>
          {p.attended && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">출석</span>
          )}
        </div>
      ))}
    </div>
  )
}
