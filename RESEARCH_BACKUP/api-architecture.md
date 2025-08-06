# API Architecture Research

## API Design Principles
1. **RESTful**: Standard HTTP methods and status codes
2. **Versioned**: /api/v1/ prefix for all endpoints
3. **Consistent**: Unified response format
4. **Secure**: Authentication required for user data
5. **Performant**: Pagination, caching, rate limiting

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "req_123456"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

## Authentication Endpoints

### POST /api/v1/auth/signup
```typescript
Request: {
  email: string
  password: string
  full_name?: string
  passport_country?: string
}

Response: {
  user: User
  session: Session
  access_token: string
  refresh_token: string
}
```

### POST /api/v1/auth/login
```typescript
Request: {
  email: string
  password: string
}

Response: {
  user: User
  session: Session
  access_token: string
  refresh_token: string
}
```

### POST /api/v1/auth/logout
```typescript
Headers: {
  Authorization: "Bearer {token}"
}

Response: {
  success: true
}
```

### POST /api/v1/auth/refresh
```typescript
Request: {
  refresh_token: string
}

Response: {
  access_token: string
  refresh_token: string
}
```

### POST /api/v1/auth/forgot-password
```typescript
Request: {
  email: string
}

Response: {
  message: "Reset email sent"
}
```

### POST /api/v1/auth/reset-password
```typescript
Request: {
  token: string
  password: string
}

Response: {
  success: true
}
```

## User Endpoints

### GET /api/v1/user/profile
```typescript
Headers: {
  Authorization: "Bearer {token}"
}

Response: {
  id: string
  email: string
  full_name: string
  passport_country: string
  nationality: string
  phone: string
  bio: string
  avatar_url: string
  created_at: string
  updated_at: string
}
```

### PUT /api/v1/user/profile
```typescript
Headers: {
  Authorization: "Bearer {token}"
}

Request: {
  full_name?: string
  passport_country?: string
  nationality?: string
  phone?: string
  bio?: string
}

Response: {
  ...updated profile
}
```

### GET /api/v1/user/settings
```typescript
Response: {
  notification_preferences: {
    email: boolean
    push: boolean
    visa_expiry: boolean
    tax_residency: boolean
    travel_reminders: boolean
  }
  display_preferences: {
    theme: "light" | "dark"
    date_format: string
    timezone: string
  }
  privacy_settings: {
    share_stats: boolean
    public_profile: boolean
  }
}
```

### PUT /api/v1/user/settings
```typescript
Request: {
  notification_preferences?: {...}
  display_preferences?: {...}
  privacy_settings?: {...}
}
```

## Travel Records Endpoints

### GET /api/v1/travel-records
```typescript
Query: {
  page?: number
  per_page?: number
  country?: string
  from_date?: string
  to_date?: string
  visa_type?: string
  sort?: "entry_date" | "exit_date" | "country"
  order?: "asc" | "desc"
}

Response: {
  data: TravelRecord[]
  pagination: Pagination
}
```

### GET /api/v1/travel-records/:id
```typescript
Response: TravelRecord
```

### POST /api/v1/travel-records
```typescript
Request: {
  country_code: string
  country_name: string
  city?: string
  entry_date: string
  exit_date?: string
  visa_type: string
  purpose?: string
  notes?: string
}

Response: TravelRecord
```

### PUT /api/v1/travel-records/:id
```typescript
Request: {
  // Partial TravelRecord fields
}

Response: TravelRecord
```

### DELETE /api/v1/travel-records/:id
```typescript
Response: {
  success: true
}
```

### POST /api/v1/travel-records/bulk
```typescript
Request: {
  records: TravelRecord[]
}

Response: {
  created: number
  errors: any[]
}
```

## Visa Calculator Endpoints

### POST /api/v1/visa-calculator
```typescript
Request: {
  destination_country: string
  check_date?: string
  include_planned?: boolean
}

Response: {
  is_compliant: boolean
  days_used: number
  days_remaining: number
  max_allowed_days: number
  period_type: string
  period_start: string
  period_end: string
  next_reset_date?: string
  warnings: Warning[]
  risk_level: "low" | "medium" | "high" | "critical"
  recommendations: string[]
}
```

### GET /api/v1/visa-calculator/schengen
```typescript
Query: {
  check_date?: string
}

Response: {
  total_schengen_days: number
  remaining_schengen_days: number
  period_start: string
  period_end: string
  is_compliant: boolean
  countries_visited: string[]
}
```

### GET /api/v1/visa-calculator/tax-residency
```typescript
Query: {
  country: string
  year?: number
}

Response: {
  days_in_country: number
  threshold: number
  is_tax_resident: boolean
  days_remaining: number
  warnings: Warning[]
}
```

## Visa Rules Endpoints

### GET /api/v1/visa-rules
```typescript
Query: {
  passport_country?: string
  destination_country?: string
  visa_type?: string
}

Response: {
  data: VisaRule[]
}
```

### GET /api/v1/visa-rules/search
```typescript
Query: {
  from: string // passport country
  to: string // destination country
}

Response: {
  visa_rules: VisaRule[]
  visa_free: boolean
  visa_on_arrival: boolean
  e_visa_available: boolean
  requirements: any
}
```

## Countries Endpoints

### GET /api/v1/countries
```typescript
Query: {
  region?: string
  schengen?: boolean
  popular?: boolean
}

Response: {
  data: Country[]
}
```

### GET /api/v1/countries/:code
```typescript
Response: Country
```

## Notifications Endpoints

### GET /api/v1/notifications
```typescript
Query: {
  unread_only?: boolean
  type?: string
  priority?: string
  page?: number
  per_page?: number
}

Response: {
  data: Notification[]
  pagination: Pagination
  unread_count: number
}
```

### PUT /api/v1/notifications/:id/read
```typescript
Response: {
  success: true
}
```

### PUT /api/v1/notifications/mark-all-read
```typescript
Response: {
  updated: number
}
```

### DELETE /api/v1/notifications/:id
```typescript
Response: {
  success: true
}
```

## Calendar Endpoints

### GET /api/v1/calendar
```typescript
Query: {
  year: number
  month?: number
}

Response: {
  stays: TravelRecord[]
  planned_trips: PlannedTrip[]
  visa_warnings: Warning[]
  holidays: Holiday[]
}
```

### GET /api/v1/calendar/export
```typescript
Query: {
  format: "ical" | "csv" | "json"
  from_date?: string
  to_date?: string
}

Response: {
  // File download or JSON data
}
```

## Analytics Endpoints

### GET /api/v1/analytics/summary
```typescript
Response: {
  total_countries: number
  total_days_traveled: number
  current_country?: string
  days_this_year: number
  favorite_countries: Array<{
    country: string
    days: number
  }>
  visa_compliance: {
    compliant_countries: number
    warning_countries: number
    critical_countries: number
  }
}
```

### GET /api/v1/analytics/yearly
```typescript
Query: {
  year: number
}

Response: {
  months: Array<{
    month: number
    days_traveled: number
    countries: string[]
  }>
  total_days: number
  total_countries: number
}
```

## Export Endpoints

### POST /api/v1/export/travel-records
```typescript
Request: {
  format: "csv" | "json" | "pdf"
  from_date?: string
  to_date?: string
  countries?: string[]
}

Response: {
  download_url: string
  expires_at: string
}
```

## Rate Limiting

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```

### Rate Limits
- **Anonymous**: 20 requests/minute
- **Authenticated**: 100 requests/minute
- **Pro Plan**: 500 requests/minute

## Error Codes

### Standard HTTP Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity
- **429**: Too Many Requests
- **500**: Internal Server Error

### Custom Error Codes
- **AUTH_REQUIRED**: Authentication required
- **AUTH_INVALID**: Invalid credentials
- **AUTH_EXPIRED**: Token expired
- **VALIDATION_ERROR**: Input validation failed
- **RESOURCE_NOT_FOUND**: Resource doesn't exist
- **RESOURCE_CONFLICT**: Resource already exists
- **RATE_LIMIT_EXCEEDED**: Too many requests
- **PERMISSION_DENIED**: Insufficient permissions
- **INTERNAL_ERROR**: Server error