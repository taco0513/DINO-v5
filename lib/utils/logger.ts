/**
 * Production-safe logger utility
 * Only logs errors in production, all levels in development
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(...args)
    }
  },
  
  log: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(...args)
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    // In a real app, this would send to an error tracking service
    // eslint-disable-next-line no-console
    console.error(...args)
  }
}