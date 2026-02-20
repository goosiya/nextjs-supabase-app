'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const eventSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  event_date: z.string().min(1, '날짜를 입력해주세요'),
  location: z.string().min(1, '장소를 입력해주세요'),
  location_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  max_participants: z.coerce.number().int().positive().optional().nullable(),
  fee: z.coerce.number().int().min(0).default(0),
})

export type EventFormData = z.infer<typeof eventSchema>

export async function createEvent(formData: EventFormData) {
  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()

  if (authError || !claimsData?.claims) {
    redirect('/auth/login')
  }

  const validated = eventSchema.safeParse(formData)
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }

  const slug = nanoid(8)
  const hostId = claimsData.claims.sub

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...validated.data,
      location_url: validated.data.location_url || null,
      host_id: hostId,
      slug,
    })
    .select('id')
    .single()

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath('/protected/events')
  redirect(`/protected/events/${data.id}`)
}

export async function updateEvent(id: string, formData: EventFormData) {
  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()

  if (authError || !claimsData?.claims) {
    redirect('/auth/login')
  }

  const validated = eventSchema.safeParse(formData)
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('events')
    .update({
      ...validated.data,
      location_url: validated.data.location_url || null,
    })
    .eq('id', id)
    .eq('host_id', claimsData.claims.sub)

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath(`/protected/events/${id}`)
  redirect(`/protected/events/${id}`)
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()

  if (authError || !claimsData?.claims) {
    redirect('/auth/login')
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('host_id', claimsData.claims.sub)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/protected/events')
  redirect('/protected/events')
}

export async function updateEventStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()

  if (authError || !claimsData?.claims) {
    return { error: '인증이 필요합니다' }
  }

  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .eq('host_id', claimsData.claims.sub)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/protected/events/${id}`)
  return { success: true }
}

export async function getMyEvents() {
  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()

  if (authError || !claimsData?.claims) {
    redirect('/auth/login')
  }

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      event_participants(count)
    `
    )
    .eq('host_id', claimsData.claims.sub)
    .order('event_date', { ascending: false })

  if (error) {
    return []
  }

  return data
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single()

  if (error) {
    return null
  }

  return data
}

export async function getEventById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from('events').select('*').eq('id', id).single()

  if (error) {
    return null
  }

  return data
}
