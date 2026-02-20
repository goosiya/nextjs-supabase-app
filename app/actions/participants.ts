'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const joinSchema = z.object({
  guest_name: z.string().min(1, '이름을 입력해주세요'),
  guest_phone: z.string().optional(),
  note: z.string().optional(),
})

export type JoinFormData = z.infer<typeof joinSchema>

export async function joinEvent(eventId: string, formData: JoinFormData) {
  const supabase = await createClient()

  const validated = joinSchema.safeParse(formData)
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }

  // 로그인 사용자면 user_id 포함
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub ?? null

  // 이미 신청했는지 확인 (로그인 사용자만)
  if (userId) {
    const { data: existing } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      return { error: { _form: ['이미 참여 신청하셨습니다'] } }
    }
  }

  const { error } = await supabase.from('event_participants').insert({
    event_id: eventId,
    user_id: userId,
    guest_name: validated.data.guest_name,
    guest_phone: validated.data.guest_phone || null,
    note: validated.data.note || null,
    status: 'confirmed',
  })

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath(`/events`)
  return { success: true }
}

export async function updateParticipantStatus(id: string, status: string, eventId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('event_participants').update({ status }).eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}

export async function updateAttendance(id: string, attended: boolean, eventId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('event_participants').update({ attended }).eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/protected/events/${eventId}/attendance`)
  return { success: true }
}

export async function getParticipants(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    return []
  }

  return data
}
