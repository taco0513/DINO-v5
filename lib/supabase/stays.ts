import { createClient } from './client'
import type { Stay } from '../types'

export async function getStays(countryCode?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('stays')
    .select('*')
    .order('entry_date', { ascending: false })
  
  if (countryCode) {
    query = query.eq('country_code', countryCode)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching stays:', error)
    return []
  }
  
  return data as Stay[]
}

export async function addStay(stay: Omit<Stay, 'id'>) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('stays')
      .insert({
        country_code: stay.countryCode,
        from_country: stay.fromCountry || null,
        entry_date: stay.entryDate,
        exit_date: stay.exitDate || null,
        entry_city: stay.entryCity || null,
        exit_city: stay.exitCity || null,
        visa_type: stay.visaType || null,
        notes: stay.notes || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error adding stay:', error.message, error.details, error.hint)
      throw new Error(`Supabase error: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('No data returned from Supabase')
    }
    
    return {
      id: data.id,
      countryCode: data.country_code,
      fromCountry: data.from_country,
      entryDate: data.entry_date,
      exitDate: data.exit_date,
      entryCity: data.entry_city,
      exitCity: data.exit_city,
      visaType: data.visa_type,
      notes: data.notes
    } as Stay
  } catch (error) {
    console.error('Failed to add stay to Supabase:', error)
    throw error
  }
}

export async function updateStay(id: string, stay: Partial<Omit<Stay, 'id'>>) {
  try {
    const supabase = createClient()
    
    const updateData: any = {}
    if (stay.countryCode) updateData.country_code = stay.countryCode
    if (stay.fromCountry !== undefined) updateData.from_country = stay.fromCountry || null
    if (stay.entryDate) updateData.entry_date = stay.entryDate
    if (stay.exitDate !== undefined) updateData.exit_date = stay.exitDate || null
    if (stay.entryCity !== undefined) updateData.entry_city = stay.entryCity || null
    if (stay.exitCity !== undefined) updateData.exit_city = stay.exitCity || null
    if (stay.visaType !== undefined) updateData.visa_type = stay.visaType || null
    if (stay.notes !== undefined) updateData.notes = stay.notes || null
    
    const { data, error } = await supabase
      .from('stays')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error updating stay:', error.message, error.details, error.hint)
      throw new Error(`Supabase error: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('No data returned from Supabase')
    }
    
    return {
      id: data.id,
      countryCode: data.country_code,
      fromCountry: data.from_country,
      entryDate: data.entry_date,
      exitDate: data.exit_date,
      entryCity: data.entry_city,
      exitCity: data.exit_city,
      visaType: data.visa_type,
      notes: data.notes
    } as Stay
  } catch (error) {
    console.error('Failed to update stay in Supabase:', error)
    throw error
  }
}

export async function deleteStay(id: string) {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('stays')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Supabase error deleting stay:', error.message, error.details, error.hint)
      throw new Error(`Supabase error: ${error.message}`)
    }
    
    return true
  } catch (error) {
    console.error('Failed to delete stay from Supabase:', error)
    throw error
  }
}