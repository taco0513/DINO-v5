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
      countries: {
        Row: {
          code: string
          name: string
          flag: string | null
        }
        Insert: {
          code: string
          name: string
          flag?: string | null
        }
        Update: {
          code?: string
          name?: string
          flag?: string | null
        }
      }
      visa_rules: {
        Row: {
          country_code: string
          max_days: number
          period_days: number
          reset_type: 'exit' | 'rolling'
          extension_days: number | null
        }
        Insert: {
          country_code: string
          max_days: number
          period_days: number
          reset_type: 'exit' | 'rolling'
          extension_days?: number | null
        }
        Update: {
          country_code?: string
          max_days?: number
          period_days?: number
          reset_type?: 'exit' | 'rolling'
          extension_days?: number | null
        }
      }
      stays: {
        Row: {
          id: string
          country_code: string
          from_country: string | null
          entry_date: string
          exit_date: string | null
          entry_city: string | null
          exit_city: string | null
          visa_type: string | null
          purpose: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          country_code: string
          from_country?: string | null
          entry_date: string
          exit_date?: string | null
          entry_city?: string | null
          exit_city?: string | null
          visa_type?: string | null
          purpose?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          country_code?: string
          from_country?: string | null
          entry_date?: string
          exit_date?: string | null
          entry_city?: string | null
          exit_city?: string | null
          visa_type?: string | null
          purpose?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}