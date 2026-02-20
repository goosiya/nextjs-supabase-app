'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { joinEvent } from '@/app/actions/participants'

const schema = z.object({
  guest_name: z.string().min(1, '이름을 입력해주세요'),
  guest_phone: z.string().optional(),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface JoinFormProps {
  eventId: string
  defaultName?: string
}

export function JoinForm({ eventId, defaultName }: JoinFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      guest_name: defaultName ?? '',
    },
  })

  function onSubmit(data: FormValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await joinEvent(eventId, data)
      if (result?.error) {
        const msg =
          '_form' in result.error
            ? (result.error._form as string[])[0]
            : '신청 중 오류가 발생했습니다'
        setServerError(msg)
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
        <p className="font-semibold text-green-700 dark:text-green-300">참여 신청 완료!</p>
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          모임 주최자가 확인 후 연락드릴 수 있습니다.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="guest_name">이름 *</Label>
        <Input
          id="guest_name"
          placeholder="참여자 이름"
          {...register('guest_name')}
          readOnly={!!defaultName}
        />
        {errors.guest_name && (
          <p className="text-sm text-destructive">{errors.guest_name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="guest_phone">연락처</Label>
        <Input
          id="guest_phone"
          type="tel"
          placeholder="010-0000-0000 (선택)"
          {...register('guest_phone')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">메모</Label>
        <Textarea
          id="note"
          placeholder="전달할 내용이 있으면 입력해주세요 (선택)"
          rows={2}
          {...register('note')}
        />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? '신청 중...' : '참여 신청하기'}
      </Button>
    </form>
  )
}
