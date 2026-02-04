export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          tutor_id: string
          full_name: string
          email: string | null
          grade_level: string | null
          status: 'active' | 'inactive' | 'archived'
          notes: string | null
          risk_score: number
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          full_name: string
          email?: string | null
          grade_level?: string | null
          status?: 'active' | 'inactive' | 'archived'
          notes?: string | null
          risk_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          full_name?: string
          email?: string | null
          grade_level?: string | null
          status?: 'active' | 'inactive' | 'archived'
          notes?: string | null
          risk_score?: number
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          tutor_id: string
          title: string
          description: string | null
          hourly_rate: number | null
          color_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          title: string
          description?: string | null
          hourly_rate?: number | null
          color_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          title?: string
          description?: string | null
          hourly_rate?: number | null
          color_code?: string | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          tutor_id: string
          course_id: string
          student_id: string | null
          start_time: string
          end_time: string
          status: 'scheduled' | 'completed' | 'cancelled'
          topic: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          course_id: string
          student_id?: string | null
          start_time: string
          end_time: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          topic?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          course_id?: string
          student_id?: string | null
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          topic?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrolled_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          tutor_id: string
          student_id: string
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'overdue'
          due_date: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          student_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'overdue'
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          student_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'overdue'
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      monthly_earnings: {
        Row: {
          tutor_id: string
          month: string
          total: number
        }
      }
    }
  }
}
