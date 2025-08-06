// Passport expiry warning system
export interface PassportWarning {
  type: 'expired' | 'expiring' | 'critical' | 'ok'
  message: string
  severity: 'error' | 'warning' | 'info' | 'success'
  daysUntilExpiry: number
}

export function checkPassportExpiry(expiryDate: string): PassportWarning {
  if (!expiryDate) {
    return {
      type: 'ok',
      message: 'No passport expiry date set',
      severity: 'info',
      daysUntilExpiry: Infinity
    }
  }

  const today = new Date()
  const expiry = new Date(expiryDate)
  const timeDiff = expiry.getTime() - today.getTime()
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysUntilExpiry < 0) {
    return {
      type: 'expired',
      message: 'Passport has expired',
      severity: 'error',
      daysUntilExpiry
    }
  } else if (daysUntilExpiry <= 90) {
    return {
      type: 'critical',
      message: `Passport expires in ${daysUntilExpiry} days - renewal required urgently`,
      severity: 'error',
      daysUntilExpiry
    }
  } else if (daysUntilExpiry <= 180) {
    return {
      type: 'expiring',
      message: `Passport expires in ${daysUntilExpiry} days - consider renewal`,
      severity: 'warning',
      daysUntilExpiry
    }
  } else if (daysUntilExpiry <= 365) {
    return {
      type: 'expiring',
      message: `Passport expires in ${daysUntilExpiry} days`,
      severity: 'info',
      daysUntilExpiry
    }
  } else {
    return {
      type: 'ok',
      message: `Passport valid for ${daysUntilExpiry} days`,
      severity: 'success',
      daysUntilExpiry
    }
  }
}

// Check if passport is valid for travel (6 months rule)
export function checkPassportValidityForTravel(expiryDate: string, travelDate?: string): PassportWarning {
  if (!expiryDate) {
    return {
      type: 'ok',
      message: 'No passport expiry date set',
      severity: 'info',
      daysUntilExpiry: Infinity
    }
  }

  const checkDate = travelDate ? new Date(travelDate) : new Date()
  const expiry = new Date(expiryDate)
  const timeDiff = expiry.getTime() - checkDate.getTime()
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24))

  // Most countries require 6 months validity
  const sixMonthsInDays = 180

  if (daysUntilExpiry < 0) {
    return {
      type: 'expired',
      message: 'Passport expired - cannot travel',
      severity: 'error',
      daysUntilExpiry
    }
  } else if (daysUntilExpiry < sixMonthsInDays) {
    return {
      type: 'critical',
      message: `Passport expires in ${daysUntilExpiry} days - may not meet 6-month validity requirement for travel`,
      severity: 'error',
      daysUntilExpiry
    }
  } else {
    return {
      type: 'ok',
      message: `Passport valid for travel (${daysUntilExpiry} days remaining)`,
      severity: 'success',
      daysUntilExpiry
    }
  }
}

// Format passport expiry date for display
export function formatPassportExpiry(expiryDate: string): string {
  if (!expiryDate) return 'Not set'
  
  const expiry = new Date(expiryDate)
  return expiry.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}