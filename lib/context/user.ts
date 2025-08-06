// Simple user context for the application
// In a real app, this would come from authentication/session

export function getCurrentUserEmail(): string | undefined {
  // For now, return the specific email to enable the 365-day Korea rule
  // In a real app, this would come from session/auth context
  return 'zbrianjin@gmail.com'
}

export function isCurrentUser(email: string): boolean {
  return getCurrentUserEmail() === email
}