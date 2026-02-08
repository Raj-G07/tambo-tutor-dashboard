'use server'

import { createServerClient } from '../../utils/supabase/server'
import { Database } from '../../types/supabase'

export async function getStudents() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }
  return data
}

export async function getCourses() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }
  return data
}

export async function getSessions() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      student:students(full_name),
      course:courses(title)
    `)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
  return data
}

export async function getRecentPayments() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      student:students(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }
  return data
}

export async function getMonthlyEarnings() {
  // Since we might not have the view created, allow fallback or raw query
  const supabase = createServerClient()

  // Try fetching from view
  const { data, error } = await supabase
    .from('monthly_earnings' as any) // Cast as any if view type is tricky or just use raw query
    .select('*')
    .limit(12)

  if (error) {
    // Fallback: Calculate manually if view missing (for demo robustness)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, paid_at')
      .eq('status', 'paid')
      .not('paid_at', 'is', null)

    if (!payments) return []

    // Simple aggregation
    const earningsByMonth: Record<string, number> = {}
    payments.forEach(p => {
      const month = new Date(p.paid_at!).toISOString().slice(0, 7) // YYYY-MM
      earningsByMonth[month] = (earningsByMonth[month] || 0) + Number(p.amount)
    })

    return Object.entries(earningsByMonth).map(([month, total]) => ({ month, total }))
  }

  return data
}

export async function getStudentRisks() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .gt('risk_score', 50)
    .order('risk_score', { ascending: false })

  if (error) {
    console.error('Error fetching risky students:', error)
    return []
  }
  return data
}

// -- MUTATIONS --
// For demo purposes, we default to the seed user ID if auth is missing/not set up with cookies
const DEMO_TUTOR_ID = 'd114c0de-0000-4000-a000-000000000000';

export async function createStudent(params: { full_name: string; email?: string; grade_level?: string; notes?: string }) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('students')
    .insert({
      tutor_id: DEMO_TUTOR_ID,
      full_name: params.full_name,
      email: params.email,
      grade_level: params.grade_level,
      notes: params.notes,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating student:', error)
    throw new Error('Failed to create student')
  }
  return data
}

export async function createCourse(params: { title: string; description?: string; hourly_rate?: number }) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('courses')
    .insert({
      tutor_id: DEMO_TUTOR_ID,
      title: params.title,
      description: params.description,
      hourly_rate: params.hourly_rate
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating course:', error)
    throw new Error('Failed to create course')
  }
  return data
}

export async function createSession(params: {
  course_id: string;
  student_id: string;
  start_time: string;
  end_time: string;
  topic?: string
}) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      tutor_id: DEMO_TUTOR_ID,
      course_id: params.course_id,
      student_id: params.student_id,
      start_time: params.start_time,
      end_time: params.end_time,
      topic: params.topic,
      status: 'scheduled'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    throw new Error('Failed to create session')
  }
  return data
}

// -- UPDATE & DELETE ACTIONS --

export async function updateStudent({
  id,
  patch,
}: {
  id: string
  patch: Record<string, any>
}) {
  // Remove undefined only (keep nulls!)
  const cleanedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  )

  if (Object.keys(cleanedPatch).length === 0) {
    throw new Error("No fields provided to update")
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("students")
    .update(cleanedPatch)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update student: ${error.message}`)
  }

  return data
}



export async function deleteStudent(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting student:', error)
    throw new Error('Failed to delete student')
  }
  return true
}

export async function updateCourse({ id, patch }: { id: string, patch: Record<string, any> }) {

  const cleanedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  )

  if (Object.keys(cleanedPatch).length === 0) {
    throw new Error("No fields provided to update")
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('courses')
    .update(cleanedPatch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating course:', error)
    throw new Error('Failed to update course')
  }
  return data
}

export async function deleteCourse(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting course:', error)
    throw new Error('Failed to delete course')
  }
  return true
}

export async function updateSession({ id, patch }: { id: string, patch: Record<string, any> }) {
  const cleanedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  )

  if (Object.keys(cleanedPatch).length === 0) {
    throw new Error("No fields provided to update")
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('sessions')
    .update(cleanedPatch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating session:', error)
    throw new Error('Failed to update session')
  }
  return data
}

export async function deleteSession(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting session:', error)
    throw new Error('Failed to delete session')
  }
  return true
}

