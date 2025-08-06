# Visa Calculation Logic Research

## Core Visa Rules

### 1. Schengen 90/180 Rule
- 90 days maximum in any 180-day rolling window
- Applies to 26 Schengen countries
- Rolling window calculation required
- No visa required for short stays (US passport holders)

### 2. Tax Residency (183-day rule)
- Most countries: 183 days in a calendar year triggers tax residency
- Some variations:
  - UK: 183 days or complex tie-breaker rules
  - US: Substantial presence test (weighted formula)
  - Canada: 183 days includes partial days

### 3. Visa Types Priority
1. Citizenship (unlimited)
2. Permanent Residence (unlimited with conditions)
3. Work Visa (country-specific limits)
4. Student Visa (tied to education period)
5. Digital Nomad Visa (varies by country)
6. Tourist Visa (shortest duration)
7. Visa-free entry (usually 30-90 days)

### 4. Country-Specific Rules Examples

#### Thailand
- Visa-free: 30 days (extendable once for 30 days)
- Tourist visa: 60 days (extendable for 30 days)
- Multiple entry: 6 months validity, 60 days per entry
- Elite visa: 5-20 years

#### Japan
- Visa-free: 90 days in 180 days
- Working Holiday: 1 year (age restrictions)
- Digital Nomad: 6 months (new)

#### Portugal
- Schengen rules apply
- D7 visa for passive income
- Golden visa (investment)
- Digital nomad visa: 1 year renewable

## Calculation Algorithms

### Rolling Window Calculation
```typescript
function calculateRollingWindow(stays: Stay[], windowDays: number, maxDays: number) {
  const today = new Date()
  const windowStart = subDays(today, windowDays - 1)
  
  const daysInWindow = stays
    .filter(stay => {
      const stayEnd = stay.exitDate || today
      return stayEnd >= windowStart
    })
    .reduce((total, stay) => {
      const overlapStart = max(stay.entryDate, windowStart)
      const overlapEnd = min(stay.exitDate || today, today)
      return total + daysBetween(overlapStart, overlapEnd)
    }, 0)
    
  return {
    daysUsed: daysInWindow,
    daysRemaining: maxDays - daysInWindow,
    isCompliant: daysInWindow <= maxDays
  }
}
```

### Tax Residency Calculation
```typescript
function calculateTaxResidency(stays: Stay[], year: number, threshold: number = 183) {
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)
  
  const daysInYear = stays
    .filter(stay => {
      const stayEnd = stay.exitDate || new Date()
      return stayEnd >= yearStart && stay.entryDate <= yearEnd
    })
    .reduce((total, stay) => {
      const overlapStart = max(stay.entryDate, yearStart)
      const overlapEnd = min(stay.exitDate || new Date(), yearEnd)
      return total + daysBetween(overlapStart, overlapEnd)
    }, 0)
    
  return {
    daysInCountry: daysInYear,
    threshold,
    isTaxResident: daysInYear >= threshold,
    daysRemaining: threshold - daysInYear
  }
}
```

## Data Requirements

### Essential Data Points
1. **Stay Records**
   - Entry date
   - Exit date (nullable for current stay)
   - Country code
   - Visa type used
   - Purpose of visit

2. **Visa Rules**
   - Passport country
   - Destination country
   - Visa type
   - Max days allowed
   - Period type (rolling/calendar/fixed)
   - Period length
   - Can extend (boolean)
   - Extension days
   - Requirements

3. **Country Information**
   - Country code (ISO)
   - Country name
   - Schengen member (boolean)
   - Tax residency days
   - Currency
   - Timezone

4. **Country Agreements**
   - Country A
   - Country B
   - Agreement type (visa waiver, tax treaty, etc.)
   - Details

## Warning Thresholds

### Risk Levels
- **Low**: < 50% of limit used
- **Medium**: 50-75% of limit used
- **High**: 75-90% of limit used
- **Critical**: > 90% of limit used

### Warning Types
1. **Approaching Limit**: 10 days before limit
2. **Tax Residency Warning**: 30 days before threshold
3. **Visa Expiry**: 14 days before expiry
4. **Overstay Risk**: Current trajectory exceeds limits
5. **Data Quality**: Missing exit dates, gaps in records

## Special Considerations

### Schengen Zone Complexity
- Entry/exit from any Schengen country counts
- Internal Schengen travel doesn't reset the clock
- Must track all Schengen stays together
- 180-day rolling window, not calendar

### Grace Periods
- Some countries allow 24-hour transit
- Airport transit may not count
- Same-day entry/exit counts as 1 day
- Partial days typically count as full days

### Visa Runs
- Not all countries allow visa runs
- Minimum time outside country varies
- Some require genuine tourism
- Immigration officer discretion

## Implementation Notes

### Performance Optimization
- Cache visa rules (update weekly)
- Pre-calculate common scenarios
- Use database indexes on dates
- Batch process notifications

### Data Integrity
- Validate overlapping stays
- Check for impossible travel
- Require exit before next entry
- Handle timezone differences

### User Experience
- Show visual timeline
- Provide clear recommendations
- Explain calculations
- Offer "what-if" scenarios