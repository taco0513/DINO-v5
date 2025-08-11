import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { stays } = await request.json()
    
    if (!stays || !Array.isArray(stays)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid stays data'
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Sync each stay to Supabase
    const results = []
    let successCount = 0
    let errorCount = 0
    
    for (const stay of stays) {
      try {
        // Prepare data for Supabase
        const supabaseData = {
          country_code: stay.countryCode,
          from_country: stay.fromCountry || null,
          entry_date: stay.entryDate,
          exit_date: stay.exitDate || null,
          entry_city: stay.entryCity || null,
          exit_city: stay.exitCity || null,
          visa_type: stay.visaType || null,
          notes: stay.notes || null
        }
        
        // Check if stay already exists (by dates and country)
        const { data: existing } = await supabase
          .from('stays')
          .select('id')
          .eq('country_code', supabaseData.country_code)
          .eq('entry_date', supabaseData.entry_date)
          .single()
        
        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('stays')
            .update(supabaseData)
            .eq('id', existing.id)
          
          if (error) {
            errorCount++
            results.push({ stay: stay.id, status: 'error', message: error.message })
          } else {
            successCount++
            results.push({ stay: stay.id, status: 'updated' })
          }
        } else {
          // Insert new
          const { error } = await supabase
            .from('stays')
            .insert(supabaseData)
          
          if (error) {
            errorCount++
            results.push({ stay: stay.id, status: 'error', message: error.message })
          } else {
            successCount++
            results.push({ stay: stay.id, status: 'created' })
          }
        }
      } catch (err) {
        errorCount++
        results.push({ 
          stay: stay.id, 
          status: 'error', 
          message: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Synced ${successCount} stays successfully, ${errorCount} errors`,
      totalStays: stays.length,
      successCount,
      errorCount,
      results
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}