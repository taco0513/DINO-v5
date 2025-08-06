import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test connection by checking if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('countries')
      .select('*')
      .limit(1)
    
    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: 'Countries table error',
        details: tablesError.message,
        hint: tablesError.hint
      }, { status: 500 })
    }
    
    // Check stays table
    const { data: stays, error: staysError } = await supabase
      .from('stays')
      .select('*')
      .limit(1)
    
    if (staysError) {
      return NextResponse.json({
        success: false,
        error: 'Stays table error',
        details: staysError.message,
        hint: staysError.hint
      }, { status: 500 })
    }
    
    // Check visa_rules table
    const { data: rules, error: rulesError } = await supabase
      .from('visa_rules')
      .select('*')
      .limit(1)
    
    if (rulesError) {
      return NextResponse.json({
        success: false,
        error: 'Visa rules table error',
        details: rulesError.message,
        hint: rulesError.hint
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tables: {
        countries: tables !== null,
        stays: stays !== null,
        visa_rules: rules !== null
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unknown error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}