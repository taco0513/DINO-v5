/**
 * User Feedback System Types
 * Community-driven visa information verification and improvement
 */

export type ReportType = 
  | 'duration_different'     // 실제 받은 기간이 달라요
  | 'visa_free_changed'      // 비자 면제 상태가 변경됐어요
  | 'new_requirement'        // 새로운 요구사항이 생겼어요
  | 'extension_info'         // 연장 정보가 틀려요
  | 'fee_changed'           // 수수료가 변경됐어요
  | 'other';                // 기타

export type ReportStatus = 
  | 'pending'               // 검토 대기
  | 'investigating'         // 조사 중
  | 'verified'             // 검증 완료
  | 'applied'              // 앱에 반영됨
  | 'rejected'             // 거부됨
  | 'duplicate';           // 중복 신고

export type NotificationType = 
  | 'new_report'           // 새로운 사용자 리포트
  | 'high_priority_report' // 중요도 높은 리포트
  | 'multiple_reports'     // 동일한 이슈 여러 신고
  | 'urgent_change';       // 긴급 변경사항

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserReport {
  id: string;
  
  // Report metadata
  reportType: ReportType;
  
  // Country information
  countryCode: string;
  countryName: string;
  
  // User experience vs app data
  userExperience: string;      // 실제로 받은 일수/경험
  currentAppData?: string;     // 앱에서 보여주는 정보
  
  // Travel details
  entryDate?: Date;
  exitDate?: Date;
  entryAirport?: string;       // Airport code
  exitAirport?: string;        // Airport code
  visaType?: string;           // tourist, business, etc.
  
  // Evidence and details
  additionalDetails?: string;
  evidenceUrls?: string[];     // Array of image/document URLs
  
  // User information
  reportedBy: string;          // User email
  userNationality?: string;    // Reporter's nationality
  
  // Processing status
  status: ReportStatus;
  processedBy?: string;
  processedAt?: Date;
  adminNotes?: string;
  
  // Verification
  verificationCount: number;   // 같은 내용 신고 수
  confidenceScore: number;     // 0.00-1.00
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserReportRequest {
  reportType: ReportType;
  countryCode: string;
  countryName: string;
  userExperience: string;
  currentAppData?: string;
  entryDate?: Date;
  exitDate?: Date;
  entryAirport?: string;
  exitAirport?: string;
  visaType?: string;
  additionalDetails?: string;
  evidenceUrls?: string[];
  userNationality?: string;
  reportedBy: string; // User email
}

export interface AdminNotification {
  id: string;
  
  // Notification details
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  
  // Related data
  relatedReportId?: string;
  countryCode?: string;
  
  // Status
  isRead: boolean;
  isArchived: boolean;
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  archivedAt?: Date;
}

export interface CountryDataAccuracy {
  countryCode: string;
  
  // Accuracy metrics
  accuracyScore: number;       // 0.00-1.00
  totalReports: number;
  verifiedReports: number;
  lastVerifiedAt?: Date;
  
  // Data freshness
  lastUpdatedAt: Date;
  lastUserFeedbackAt?: Date;
  needsReview: boolean;
  
  // Crowd verification
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
}

export interface FeedbackStats {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  topReportedCountries: Array<{
    countryCode: string;
    countryName: string;
    reportCount: number;
    accuracyScore: number;
  }>;
  recentActivity: Array<{
    date: Date;
    reportCount: number;
    verificationsCount: number;
  }>;
}

// UI Component Props
export interface FeedbackButtonProps {
  countryCode: string;
  countryName: string;
  currentVisaInfo: {
    duration?: number;
    visaRequired?: boolean;
    resetType?: string;
  };
  userEmail: string;
  onSubmit?: (report: CreateUserReportRequest) => void;
}

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (report: CreateUserReportRequest) => Promise<void>;
  countryCode: string;
  countryName: string;
  currentAppData?: string;
  userEmail: string;
}

export interface AdminFeedbackDashboardProps {
  reports: UserReport[];
  notifications: AdminNotification[];
  stats: FeedbackStats;
  onProcessReport: (reportId: string, action: 'verify' | 'reject' | 'investigate', notes?: string) => Promise<void>;
  onMarkNotificationRead: (notificationId: string) => Promise<void>;
}

// Utility types for filtering and sorting
export interface ReportFilters {
  status?: ReportStatus[];
  reportType?: ReportType[];
  countryCode?: string[];
  priority?: Priority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ReportSortOptions {
  field: 'createdAt' | 'priority' | 'verificationCount' | 'confidenceScore';
  direction: 'asc' | 'desc';
}

// API Response types
export interface FeedbackApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedReports {
  reports: UserReport[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}