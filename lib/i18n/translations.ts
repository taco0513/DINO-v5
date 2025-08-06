// Internationalization system
export interface Translations {
  // Navigation
  'nav.dashboard': string
  'nav.calendar': string
  'nav.settings': string
  'nav.signin': string
  'nav.signout': string
  
  // Calendar
  'calendar.title': string
  'calendar.filterCountry': string
  'calendar.today': string
  'calendar.monthView': string
  'calendar.weekView': string
  'calendar.multiMonthView': string
  
  // Stays
  'stays.entryExitRecords': string
  'stays.recentStays': string
  'stays.addNewRecord': string
  'stays.editRecord': string
  'stays.addRecord': string
  'stays.updateRecord': string
  'stays.deleteRecord': string
  'stays.country': string
  'stays.entryDate': string
  'stays.exitDate': string
  'stays.purpose': string
  'stays.notes': string
  'stays.cancel': string
  'stays.days': string
  'stays.viewAllStays': string
  'stays.showLess': string
  'stays.noStaysFound': string
  'stays.filterAll': string
  'stays.entries': string
  
  // Travel purposes
  'purpose.tourism': string
  'purpose.business': string
  'purpose.transit': string
  
  // Settings
  'settings.title': string
  'settings.saveChanges': string
  'settings.saving': string
  'settings.profilePassport': string
  'settings.nationality': string
  'settings.passportIssued': string
  'settings.passportExpiry': string
  'settings.interface': string
  'settings.theme': string
  'settings.language': string
  'settings.weekStartsOn': string
  'settings.privacy': string
  'settings.dataRetention': string
  'settings.allowAnalytics': string
  'settings.dangerZone': string
  'settings.deleteAllData': string
  'settings.deleteConfirm': string
  'settings.deleteEverything': string
  'settings.deleteCancel': string
  
  // Theme options
  'theme.light': string
  'theme.dark': string
  
  // Language options
  'lang.english': string
  'lang.korean': string
  
  // Week start options
  'week.sunday': string
  'week.monday': string
  
  // Data retention options
  'retention.30days': string
  'retention.90days': string
  'retention.1year': string
  'retention.3years': string
  'retention.forever': string
  
  // Countries
  'country.US': string
  'country.KR': string
  'country.JP': string
  'country.TH': string
  'country.VN': string
  'country.CN': string
  'country.GB': string
  'country.DE': string
  'country.FR': string
  'country.CA': string
  'country.AU': string
  
  // Messages
  'msg.settingsSaved': string
  'msg.dataDeleted': string
  'msg.stayAdded': string
  'msg.stayUpdated': string
  'msg.stayDeleted': string
  'msg.confirmDelete': string
  'msg.confirmDeleteData': string
  
  // Visa warnings
  'visa.daysRemaining': string
  'visa.expired': string
  'visa.warning': string
}

export const translations: { [lang: string]: Translations } = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.calendar': 'Calendar',
    'nav.settings': 'Settings',
    'nav.signin': 'Sign in',
    'nav.signout': 'Sign out',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.filterCountry': 'Filter by Country',
    'calendar.today': 'Today',
    'calendar.monthView': 'Month',
    'calendar.weekView': 'Week',
    'calendar.multiMonthView': 'Multi-Month',
    
    // Stays
    'stays.entryExitRecords': 'Entry/Exit Records',
    'stays.recentStays': 'Recent Stays',
    'stays.addNewRecord': 'Add New Record',
    'stays.editRecord': 'Edit Record',
    'stays.addRecord': 'Add Record',
    'stays.updateRecord': 'Update Record',
    'stays.deleteRecord': 'Delete',
    'stays.country': 'Country',
    'stays.entryDate': 'Entry Date',
    'stays.exitDate': 'Exit Date',
    'stays.purpose': 'Purpose',
    'stays.notes': 'Notes',
    'stays.cancel': 'Cancel',
    'stays.days': 'days',
    'stays.viewAllStays': 'View All Stays',
    'stays.showLess': 'Show Less',
    'stays.noStaysFound': 'No stays found',
    'stays.filterAll': 'All Countries',
    'stays.entries': 'entries',
    
    // Travel purposes
    'purpose.tourism': 'Tourism',
    'purpose.business': 'Business',
    'purpose.transit': 'Transit',
    
    // Settings
    'settings.title': 'Settings',
    'settings.saveChanges': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.profilePassport': 'Profile & Passport Information',
    'settings.nationality': 'Nationality',
    'settings.passportIssued': 'Passport Issued Date',
    'settings.passportExpiry': 'Passport Expiry Date',
    'settings.interface': 'Interface Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.weekStartsOn': 'Week Starts On',
    'settings.privacy': 'Privacy & Data',
    'settings.dataRetention': 'Data Retention Period',
    'settings.allowAnalytics': 'Allow usage analytics',
    'settings.dangerZone': 'Danger Zone',
    'settings.deleteAllData': 'Delete All Data',
    'settings.deleteConfirm': 'Delete All Data?',
    'settings.deleteEverything': 'Delete Everything',
    'settings.deleteCancel': 'Cancel',
    
    // Theme options
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    
    // Language options
    'lang.english': 'English',
    'lang.korean': '한국어',
    
    // Week start options
    'week.sunday': 'Sunday',
    'week.monday': 'Monday',
    
    // Data retention options
    'retention.30days': '30 days',
    'retention.90days': '90 days',
    'retention.1year': '1 year',
    'retention.3years': '3 years',
    'retention.forever': 'Forever',
    
    // Countries
    'country.US': 'United States',
    'country.KR': 'South Korea',
    'country.JP': 'Japan',
    'country.TH': 'Thailand',
    'country.VN': 'Vietnam',
    'country.CN': 'China',
    'country.GB': 'United Kingdom',
    'country.DE': 'Germany',
    'country.FR': 'France',
    'country.CA': 'Canada',
    'country.AU': 'Australia',
    
    // Messages
    'msg.settingsSaved': 'Settings saved successfully!',
    'msg.dataDeleted': 'All data deleted successfully!',
    'msg.stayAdded': 'Stay added successfully!',
    'msg.stayUpdated': 'Stay updated successfully!',
    'msg.stayDeleted': 'Stay deleted successfully!',
    'msg.confirmDelete': 'Are you sure you want to delete this stay record?',
    'msg.confirmDeleteData': 'Are you absolutely sure you want to delete all your data? This action cannot be undone.',
    
    // Visa warnings
    'visa.daysRemaining': 'days remaining',
    'visa.expired': 'Expired',
    'visa.warning': 'Warning',
  },
  
  ko: {
    // Navigation
    'nav.dashboard': '대시보드',
    'nav.calendar': '캘린더',
    'nav.settings': '설정',
    'nav.signin': '로그인',
    'nav.signout': '로그아웃',
    
    // Calendar
    'calendar.title': '캘린더',
    'calendar.filterCountry': '국가별 필터',
    'calendar.today': '오늘',
    'calendar.monthView': '월간',
    'calendar.weekView': '주간',
    'calendar.multiMonthView': '다중 월간',
    
    // Stays
    'stays.entryExitRecords': '입출국 기록',
    'stays.recentStays': '최근 체류',
    'stays.addNewRecord': '새 기록 추가',
    'stays.editRecord': '기록 편집',
    'stays.addRecord': '기록 추가',
    'stays.updateRecord': '기록 업데이트',
    'stays.deleteRecord': '삭제',
    'stays.country': '국가',
    'stays.entryDate': '입국일',
    'stays.exitDate': '출국일',
    'stays.purpose': '목적',
    'stays.notes': '메모',
    'stays.cancel': '취소',
    'stays.days': '일',
    'stays.viewAllStays': '모든 체류 보기',
    'stays.showLess': '접기',
    'stays.noStaysFound': '체류 기록이 없습니다',
    'stays.filterAll': '모든 국가',
    'stays.entries': '항목',
    
    // Travel purposes
    'purpose.tourism': '관광',
    'purpose.business': '사업',
    'purpose.transit': '경유',
    
    // Settings
    'settings.title': '설정',
    'settings.saveChanges': '변경사항 저장',
    'settings.saving': '저장 중...',
    'settings.profilePassport': '프로필 & 여권 정보',
    'settings.nationality': '국적',
    'settings.passportIssued': '여권 발급일',
    'settings.passportExpiry': '여권 만료일',
    'settings.interface': '인터페이스 설정',
    'settings.theme': '테마',
    'settings.language': '언어',
    'settings.weekStartsOn': '주 시작 요일',
    'settings.privacy': '개인정보 & 데이터',
    'settings.dataRetention': '데이터 보존 기간',
    'settings.allowAnalytics': '사용 분석 허용',
    'settings.dangerZone': '위험 구역',
    'settings.deleteAllData': '모든 데이터 삭제',
    'settings.deleteConfirm': '모든 데이터를 삭제하시겠습니까?',
    'settings.deleteEverything': '모든 것 삭제',
    'settings.deleteCancel': '취소',
    
    // Theme options
    'theme.light': '라이트 모드',
    'theme.dark': '다크 모드',
    
    // Language options
    'lang.english': 'English',
    'lang.korean': '한국어',
    
    // Week start options
    'week.sunday': '일요일',
    'week.monday': '월요일',
    
    // Data retention options
    'retention.30days': '30일',
    'retention.90days': '90일',
    'retention.1year': '1년',
    'retention.3years': '3년',
    'retention.forever': '영구',
    
    // Countries
    'country.US': '미국',
    'country.KR': '한국',
    'country.JP': '일본',
    'country.TH': '태국',
    'country.VN': '베트남',
    'country.CN': '중국',
    'country.GB': '영국',
    'country.DE': '독일',
    'country.FR': '프랑스',
    'country.CA': '캐나다',
    'country.AU': '호주',
    
    // Messages
    'msg.settingsSaved': '설정이 성공적으로 저장되었습니다!',
    'msg.dataDeleted': '모든 데이터가 성공적으로 삭제되었습니다!',
    'msg.stayAdded': '체류 기록이 성공적으로 추가되었습니다!',
    'msg.stayUpdated': '체류 기록이 성공적으로 업데이트되었습니다!',
    'msg.stayDeleted': '체류 기록이 성공적으로 삭제되었습니다!',
    'msg.confirmDelete': '이 체류 기록을 삭제하시겠습니까?',
    'msg.confirmDeleteData': '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    
    // Visa warnings
    'visa.daysRemaining': '일 남음',
    'visa.expired': '만료됨',
    'visa.warning': '경고',
  }
}

// Get translation for a key
export function t(key: keyof Translations, lang: string = 'en'): string {
  const langTranslations = translations[lang] || translations.en
  return langTranslations[key] || key
}

// Language context hook
import { createContext, useContext } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: keyof Translations) => string
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}