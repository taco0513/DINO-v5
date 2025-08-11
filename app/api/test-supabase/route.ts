import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test connection by trying to count stays
    const { count, error } = await supabase
      .from('stays')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      return NextResponse.json({
        connected: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    // Also test if we can fetch countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('code, name')
      .limit(5)
    
    return NextResponse.json({
      connected: true,
      staysCount: count || 0,
      countriesCount: countries?.length || 0,
      message: 'Supabase connection successful',
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    }, { status: 500 })
  }
}