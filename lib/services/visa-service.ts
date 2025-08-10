/**
 * Visa Information Service
 * Handles all visa data operations with Supabase and localStorage fallback
 */

import { createClient } from '@/lib/supabase/client'
import { 
  VisaInformation, 
  VisaData, 
  VisaType, 
  VisaInfoResponse, 
  SingleVisaResponse,
  CreateVisaRequest,
  UpdateVisaRequest,
  VisaUpdateLog,
  VisaSummary,
  VisaValidationResult
} from '@/lib/types/visa'
import { Country } from '@/lib/types'
import { logger } from '@/lib/utils/logger'

// Database record interface for visa_information table
interface VisaInformationRecord {
  id: string
  country_code: string
  visa_type: VisaType
  data: VisaData
  last_updated: string
  updated_by: string
  source: 'official' | 'community' | 'ai_generated'
  is_verified: boolean
  created_at?: string
}

const VISA_STORAGE_KEY = 'visa_information_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export class VisaService {
  private static instance: VisaService
  private supabase = createClient()
  private cache: Map<string, VisaInformation> = new Map()
  private lastCacheUpdate: Date | null = null

  private constructor() {
    this.loadFromLocalStorage()
  }

  static getInstance(): VisaService {
    if (!VisaService.instance) {
      VisaService.instance = new VisaService()
    }
    return VisaService.instance
  }

  /**
   * Get visa information for a specific country and visa type
   */
  async getVisaInfo(countryCode: string, visaType: VisaType): Promise<SingleVisaResponse> {
    try {
      const cacheKey = `${countryCode}_${visaType}`
      
      // Check cache first
      if (this.isCacheValid() && this.cache.has(cacheKey)) {
        return { data: this.cache.get(cacheKey)! }
      }

      // Fetch from Supabase
      const { data, error } = await this.supabase
        .from('visa_information')
        .select('*')
        .eq('country_code', countryCode)
        .eq('visa_type', visaType)
        .single()

      if (error) {
        logger.warn(`Visa info not found for ${countryCode}-${visaType}:`, error)
        return { data: null, error: error.message }
      }

      // Parse and cache the result
      const visaInfo = this.parseVisaInfo(data)
      this.cache.set(cacheKey, visaInfo)
      this.saveToLocalStorage()

      return { data: visaInfo }
    } catch (error) {
      logger.error('Error fetching visa info:', error)
      return { data: null, error: 'Failed to fetch visa information' }
    }
  }

  /**
   * Get all visa information for a country
   */
  async getCountryVisaInfo(countryCode: string): Promise<VisaInfoResponse> {
    try {
      // Try Supabase first
      const { data, error } = await this.supabase
        .from('visa_information')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_verified', true)
        .order('visa_type')

      if (error) {
        logger.warn('Supabase error, using cache:', error)
        return this.getFromCache(countryCode)
      }

      // Parse and cache results
      const visaInfos = data.map(item => this.parseVisaInfo(item))
      
      // Update cache
      visaInfos.forEach(info => {
        const cacheKey = `${info.countryCode}_${info.visaType}`
        this.cache.set(cacheKey, info)
      })
      this.saveToLocalStorage()

      return { data: visaInfos }
    } catch (error) {
      logger.error('Error fetching country visa info:', error)
      return this.getFromCache(countryCode)
    }
  }

  /**
   * Get visa summaries for multiple countries
   */
  async getVisaSummaries(countryCodes: string[], countries: Country[]): Promise<VisaSummary[]> {
    const summaries: VisaSummary[] = []

    for (const code of countryCodes) {
      const country = countries.find(c => c.code === code)
      if (!country) continue

      const { data: visaInfos } = await this.getCountryVisaInfo(code)
      
      const touristVisa = visaInfos.find(v => v.visaType === 'tourist')
      const digitalNomadVisa = visaInfos.find(v => v.visaType === 'digital_nomad')
      const alerts = visaInfos.find(v => v.visaType === 'alerts')

      summaries.push({
        countryCode: code,
        countryName: country.name,
        touristVisa: touristVisa ? {
          visaRequired: touristVisa.data.visaRequired || false,
          duration: touristVisa.data.duration || 0,
          extensible: touristVisa.data.extension?.available || false
        } : undefined,
        digitalNomadVisa: digitalNomadVisa ? {
          available: digitalNomadVisa.data.available || false,
          name: digitalNomadVisa.data.officialName || 'Digital Nomad Visa',
          duration: digitalNomadVisa.data.duration || 0,
          minIncome: undefined // Income data structure has been simplified
        } : undefined,
        hasAlerts: !!alerts && !!alerts.data.alerts && alerts.data.alerts.length > 0,
        lastUpdated: touristVisa?.lastUpdated || new Date()
      })
    }

    return summaries
  }

  /**
   * Create or update visa information (admin only)
   */
  async upsertVisaInfo(request: CreateVisaRequest): Promise<SingleVisaResponse> {
    try {
      // Validate the data first
      const validation = this.validateVisaData(request.data, request.visaType)
      if (!validation.isValid) {
        return { data: null, error: validation.errors?.join(', ') }
      }

      // Check for existing record
      const existing = await this.getVisaInfo(request.countryCode, request.visaType)
      
      // Prepare the record
      const record = {
        country_code: request.countryCode,
        visa_type: request.visaType,
        data: request.data,
        source: request.source,
        updated_by: request.updatedBy,
        last_updated: new Date().toISOString(),
        is_verified: request.source === 'official'
      }

      // Insert or update
      const { data, error } = await this.supabase
        .from('visa_information')
        .upsert(record, {
          onConflict: 'country_code,visa_type'
        })
        .select()
        .single()

      if (error) {
        logger.error('Error upserting visa info:', error)
        return { data: null, error: error.message }
      }

      // Log the change
      if (existing.data) {
        await this.logChange(
          request.countryCode,
          request.visaType,
          'update',
          existing.data.data,
          request.data,
          request.updatedBy
        )
      } else {
        await this.logChange(
          request.countryCode,
          request.visaType,
          'create',
          null,
          request.data,
          request.updatedBy
        )
      }

      // Update cache
      const visaInfo = this.parseVisaInfo(data)
      const cacheKey = `${request.countryCode}_${request.visaType}`
      this.cache.set(cacheKey, visaInfo)
      this.saveToLocalStorage()

      return { data: visaInfo }
    } catch (error) {
      logger.error('Error in upsertVisaInfo:', error)
      return { data: null, error: 'Failed to save visa information' }
    }
  }

  /**
   * Delete visa information (admin only)
   */
  async deleteVisaInfo(countryCode: string, visaType: VisaType, deletedBy: string): Promise<boolean> {
    try {
      // Get existing data for logging
      const existing = await this.getVisaInfo(countryCode, visaType)
      
      if (!existing.data) {
        return false
      }

      // Delete from Supabase
      const { error } = await this.supabase
        .from('visa_information')
        .delete()
        .eq('country_code', countryCode)
        .eq('visa_type', visaType)

      if (error) {
        logger.error('Error deleting visa info:', error)
        return false
      }

      // Log the deletion
      await this.logChange(
        countryCode,
        visaType,
        'delete',
        existing.data.data,
        null,
        deletedBy
      )

      // Remove from cache
      const cacheKey = `${countryCode}_${visaType}`
      this.cache.delete(cacheKey)
      this.saveToLocalStorage()

      return true
    } catch (error) {
      logger.error('Error in deleteVisaInfo:', error)
      return false
    }
  }

  /**
   * Get update history for a country
   */
  async getUpdateHistory(countryCode: string): Promise<VisaUpdateLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('visa_update_logs')
        .select('*')
        .eq('country_code', countryCode)
        .order('changed_at', { ascending: false })
        .limit(50)

      if (error) {
        logger.error('Error fetching update history:', error)
        return []
      }

      return data.map(log => ({
        ...log,
        changedAt: new Date(log.changed_at)
      }))
    } catch (error) {
      logger.error('Error in getUpdateHistory:', error)
      return []
    }
  }

  /**
   * Validate visa data
   */
  private validateVisaData(data: VisaData, visaType: VisaType): VisaValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Type-specific validation
    switch (visaType) {
      case 'tourist':
        if (data.visaRequired === undefined) {
          errors.push('visaRequired field is required for tourist visa')
        }
        if (!data.visaRequired && !data.duration) {
          errors.push('duration is required for visa-free entry')
        }
        if (!data.resetType) {
          errors.push('resetType is required')
        }
        break

      case 'digital_nomad':
        if (data.available === undefined) {
          errors.push('available field is required for digital nomad visa')
        }
        if (data.available) {
          if (!data.officialName) {
            errors.push('officialName is required when visa is available')
          }
          if (!data.duration) {
            errors.push('duration is required when visa is available')
          }
          if (!data.requirements) {
            warnings.push('requirements should be specified')
          }
        }
        break

      case 'alerts':
        if (!data.alerts || data.alerts.length === 0) {
          errors.push('At least one alert is required for alerts type')
        }
        break
    }

    // Common validation
    if (data.fees && data.fees.amount < 0) {
      errors.push('Fee amount cannot be negative')
    }

    if (data.processingTime) {
      if (data.processingTime.min > data.processingTime.max) {
        errors.push('Minimum processing time cannot be greater than maximum')
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  /**
   * Log changes to visa information
   */
  private async logChange(
    countryCode: string,
    visaType: string,
    changeType: 'create' | 'update' | 'delete' | 'verify',
    oldData: VisaData | null,
    newData: VisaData | null,
    changedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('visa_update_logs')
        .insert({
          country_code: countryCode,
          visa_type: visaType,
          change_type: changeType,
          old_data: oldData,
          new_data: newData,
          changed_by: changedBy,
          notes
        })
    } catch (error) {
      logger.error('Error logging visa change:', error)
    }
  }

  /**
   * Parse visa information from database
   */
  private parseVisaInfo(data: VisaInformationRecord): VisaInformation {
    return {
      id: data.id,
      countryCode: data.country_code,
      visaType: data.visa_type,
      data: data.data,
      lastUpdated: new Date(data.last_updated),
      updatedBy: data.updated_by,
      source: data.source,
      isVerified: data.is_verified,
      createdAt: data.created_at ? new Date(data.created_at) : undefined
    }
  }

  /**
   * Get from cache for a country
   */
  private getFromCache(countryCode: string): VisaInfoResponse {
    const cached: VisaInformation[] = []
    
    this.cache.forEach((value, key) => {
      if (key.startsWith(`${countryCode}_`)) {
        cached.push(value)
      }
    })

    if (cached.length > 0) {
      logger.info(`Using cached visa data for ${countryCode}`)
      return { data: cached }
    }

    return { data: [], error: 'No cached data available' }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate) return false
    
    const now = new Date().getTime()
    const lastUpdate = this.lastCacheUpdate.getTime()
    
    return (now - lastUpdate) < CACHE_DURATION
  }

  /**
   * Save cache to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      const cacheData = {
        data: Array.from(this.cache.entries()),
        lastUpdate: new Date().toISOString()
      }
      
      localStorage.setItem(VISA_STORAGE_KEY, JSON.stringify(cacheData))
      this.lastCacheUpdate = new Date()
    } catch (error) {
      logger.error('Error saving visa cache to localStorage:', error)
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      const stored = localStorage.getItem(VISA_STORAGE_KEY)
      if (!stored) return

      const cacheData = JSON.parse(stored)
      
      // Rebuild cache map
      this.cache = new Map(cacheData.data)
      this.lastCacheUpdate = new Date(cacheData.lastUpdate)
      
      logger.info(`Loaded ${this.cache.size} visa records from cache`)
    } catch (error) {
      logger.error('Error loading visa cache from localStorage:', error)
      this.cache.clear()
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear()
    this.lastCacheUpdate = null
    
    // Check if we're in browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(VISA_STORAGE_KEY)
    }
    
    logger.info('Visa cache cleared')
  }

  /**
   * Refresh cache from database
   */
  async refreshCache(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('visa_information')
        .select('*')
        .eq('is_verified', true)

      if (error) {
        logger.error('Error refreshing visa cache:', error)
        return
      }

      // Clear and rebuild cache
      this.cache.clear()
      
      data.forEach(item => {
        const visaInfo = this.parseVisaInfo(item)
        const cacheKey = `${visaInfo.countryCode}_${visaInfo.visaType}`
        this.cache.set(cacheKey, visaInfo)
      })

      this.saveToLocalStorage()
      logger.info(`Refreshed visa cache with ${this.cache.size} records`)
    } catch (error) {
      logger.error('Error in refreshCache:', error)
    }
  }
}

// Export singleton instance
export const visaService = VisaService.getInstance()