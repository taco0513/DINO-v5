/**
 * Feedback Service - Handles user feedback and admin notifications
 */

import { createClient } from '@/lib/supabase/client'
import { CreateUserReportRequest, UserReport } from '@/lib/types/feedback'
import { logger } from '@/lib/utils/logger'

export class FeedbackService {
  private supabase = createClient()

  /**
   * Submit a new user report
   */
  async submitReport(report: CreateUserReportRequest): Promise<UserReport> {
    try {
      const { data, error } = await this.supabase
        .from('user_reports')
        .insert({
          report_type: report.reportType,
          country_code: report.countryCode,
          country_name: report.countryName,
          user_experience: report.userExperience,
          current_app_data: report.currentAppData || null,
          entry_date: report.entryDate?.toISOString().split('T')[0] || null,
          exit_date: report.exitDate?.toISOString().split('T')[0] || null,
          entry_airport: report.entryAirport || null,
          exit_airport: report.exitAirport || null,
          visa_type: report.visaType || null,
          additional_details: report.additionalDetails || null,
          evidence_urls: report.evidenceUrls || null,
          reported_by: report.reportedBy,
          user_nationality: report.userNationality || 'US',
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        logger.error('Failed to submit report:', error)
        throw new Error(`Failed to submit report: ${error.message}`)
      }

      // Transform database response to UserReport type
      const userReport: UserReport = {
        id: data.id,
        reportType: data.report_type,
        countryCode: data.country_code,
        countryName: data.country_name,
        userExperience: data.user_experience,
        currentAppData: data.current_app_data,
        entryDate: data.entry_date ? new Date(data.entry_date) : undefined,
        exitDate: data.exit_date ? new Date(data.exit_date) : undefined,
        entryAirport: data.entry_airport,
        exitAirport: data.exit_airport,
        visaType: data.visa_type,
        additionalDetails: data.additional_details,
        evidenceUrls: data.evidence_urls || [],
        reportedBy: data.reported_by,
        userNationality: data.user_nationality,
        status: data.status,
        processedBy: data.processed_by,
        processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
        adminNotes: data.admin_notes,
        verificationCount: data.verification_count || 1,
        confidenceScore: parseFloat(data.confidence_score) || 0.0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }

      logger.info('Report submitted successfully:', { reportId: userReport.id, countryCode: report.countryCode })
      return userReport

    } catch (error) {
      logger.error('Error submitting feedback report:', error)
      throw error
    }
  }

  /**
   * Check if user has recently submitted a similar report to prevent spam
   */
  async checkRecentSimilarReport(
    userEmail: string, 
    countryCode: string, 
    reportType: string,
    hoursThreshold: number = 24
  ): Promise<boolean> {
    try {
      const since = new Date()
      since.setHours(since.getHours() - hoursThreshold)

      const { data, error } = await this.supabase
        .from('user_reports')
        .select('id')
        .eq('reported_by', userEmail)
        .eq('country_code', countryCode)
        .eq('report_type', reportType)
        .gte('created_at', since.toISOString())
        .limit(1)

      if (error) {
        logger.error('Failed to check for similar reports:', error)
        return false // Allow submission on error
      }

      return (data?.length || 0) > 0

    } catch (error) {
      logger.error('Error checking similar reports:', error)
      return false // Allow submission on error
    }
  }

  /**
   * Get reports for a specific country
   */
  async getCountryReports(countryCode: string, limit: number = 10): Promise<UserReport[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_reports')
        .select('*')
        .eq('country_code', countryCode)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('Failed to get country reports:', error)
        throw error
      }

      return data.map(report => ({
        id: report.id,
        reportType: report.report_type,
        countryCode: report.country_code,
        countryName: report.country_name,
        userExperience: report.user_experience,
        currentAppData: report.current_app_data,
        entryDate: report.entry_date ? new Date(report.entry_date) : undefined,
        exitDate: report.exit_date ? new Date(report.exit_date) : undefined,
        entryAirport: report.entry_airport,
        exitAirport: report.exit_airport,
        visaType: report.visa_type,
        additionalDetails: report.additional_details,
        evidenceUrls: report.evidence_urls || [],
        reportedBy: report.reported_by,
        userNationality: report.user_nationality,
        status: report.status,
        processedBy: report.processed_by,
        processedAt: report.processed_at ? new Date(report.processed_at) : undefined,
        adminNotes: report.admin_notes,
        verificationCount: report.verification_count || 1,
        confidenceScore: parseFloat(report.confidence_score) || 0.0,
        createdAt: new Date(report.created_at),
        updatedAt: new Date(report.updated_at)
      }))

    } catch (error) {
      logger.error('Error getting country reports:', error)
      throw error
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService()