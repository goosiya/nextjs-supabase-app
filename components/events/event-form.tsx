'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createEvent, updateEvent } from '@/app/actions/events'
import type { Tables } from '@/types/database.types'

// 폼 입력값 스키마 (coerce 없이 문자열로 받음)
const schema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  event_date: z.string().min(1, '날짜를 입력해주세요'),
  location: z.string().min(1, '장소를 입력해주세요'),
  location_url: z.string().optional(),
  max_participants: z.string().optional(),
  fee: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EventFormProps {
  event?: Tables<'events'>
}

export function EventForm({ event }: EventFormProps) {
  const [isPending, startTransition] = useTransition()

  const defaultDate = event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      event_date: defaultDate,
      location: event?.location ?? '',
      location_url: event?.location_url ?? '',
      max_participants: event?.max_participants?.toString() ?? '',
      fee: event?.fee?.toString() ?? '0',
    },
  })

  function onSubmit(data: FormValues) {
    // 문자열 → 숫자 변환
    const payload = {
      title: data.title,
      description: data.description,
      event_date: data.event_date,
      location: data.location,
      location_url: data.location_url,
      max_participants:
        data.max_participants && data.max_participants.trim() !== ''
          ? parseInt(data.max_participants, 10)
          : null,
      fee: data.fee && data.fee.trim() !== '' ? parseInt(data.fee, 10) : 0,
    }

    startTransition(async () => {
      if (event) {
        await updateEvent(event.id, payload)
      } else {
        await createEvent(payload)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">모임 제목 *</Label>
        <Input id="title" placeholder="예: 수요일 수영 모임" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="모임에 대한 설명을 입력하세요"
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event_date">날짜 및 시간 *</Label>
        <Input id="event_date" type="datetime-local" {...register('event_date')} />
        {errors.event_date && (
          <p className="text-sm text-destructive">{errors.event_date.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">장소 *</Label>
        <Input id="location" placeholder="예: 올림픽 수영장" {...register('location')} />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location_url">지도 링크</Label>
        <Input
          id="location_url"
          type="url"
          placeholder="카카오맵/구글맵 링크 (선택)"
          {...register('location_url')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="max_participants">최대 인원</Label>
          <Input
            id="max_participants"
            type="number"
            min="1"
            placeholder="제한 없음"
            {...register('max_participants')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fee">참가비 (원)</Label>
          <Input id="fee" type="number" min="0" placeholder="0" {...register('fee')} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? '저장 중...' : event ? '수정하기' : '모임 만들기'}
      </Button>
    </form>
  )
}
