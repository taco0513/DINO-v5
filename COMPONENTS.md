# Component Documentation

This document describes the React components in DINO-v5 and their recent UI improvements.

## Overview

DINO-v5 uses Material-UI (MUI) components with a Google Material Design 3 style. Recent improvements include:
- From/To travel structure implementation
- Conditional rendering based on data presence
- Enhanced form validation and user experience

## Core Components

### Sidebar Component
**Location:** `/components/sidebar/Sidebar.tsx`

**Purpose:** Navigation sidebar with integrated "Add Stay" modal

**Key Features:**
- Collapsible sidebar with Material Design transitions
- Floating Action Button (FAB) for quick record addition
- Modal form with From/To travel structure
- User authentication integration

**Recent Changes:**
- Updated modal form to support From/To country selection
- Added airport code fields (entry_city, exit_city)
- Implemented visa type selection with country-specific options
- Made exit date optional for ongoing stays

**Props:**
```typescript
interface SidebarProps {
  countries: Country[]
  selectedCountry: string
  onSelectCountry: (code: string) => void
  currentPage?: string
  onAddStay?: (stayData: any) => void
}
```

**Form Structure:**
```
From Country → Departure Airport → To Country → Arrival Airport
                ↓
Entry Date → Exit Date (Optional) → Visa Type → Notes
```

### Calendar Components

#### CalendarCountryFilter
**Location:** `/components/calendar/CalendarCountryFilter.tsx`

**Purpose:** Filter for visa window display

**Key Improvement:** Conditional rendering
```typescript
if (stays.length === 0 || availableCountries.length === 0) {
  return null
}
```

**Props:**
```typescript
interface CalendarCountryFilterProps {
  stays: Stay[]
  countries: Country[]
  onCountryChange: (country: string) => void
}
```

#### VisaWindows
**Location:** `/components/calendar/VisaWindows.tsx`

**Purpose:** Display visa compliance status for each country

**Key Improvement:** Only show countries with actual stays
```typescript
const countriesWithStays = Array.from(new Set(stays.map(stay => stay.countryCode)))
```

#### RollingCalendar
**Location:** `/components/calendar/RollingCalendar.tsx`

**Purpose:** Calendar view with stay indicators

**Key Improvement:** Hide stay indicators when no data
```typescript
{stays.length > 0 && (
  <Box sx={{ mt: 4, pt: 2, px: 3, borderTop: '1px solid #f1f3f4' }}>
    {/* Stay indicators */}
  </Box>
)}
```

#### CountryFilter (Dashboard)
**Location:** `/components/calendar/CountryFilter.tsx`

**Purpose:** Dashboard country filter widget

**Key Improvement:** Conditional rendering based on stays
```typescript
if (stays.length === 0) {
  return null
}
```

## Stay Management Components

### StayManager
**Location:** `/components/stays/StayManager.tsx`

**Purpose:** Main form for adding/editing travel records

**Key Features:**
- From/To country travel flow
- Airport code validation (uppercase, 5 char limit)
- Country-specific visa type options
- Form validation with error handling

**Form Layout:**
```
Grid Layout (2 columns on md+):
├── From Country (6 cols)          ├── Departure Airport (6 cols)
├── To Country (6 cols)            ├── Arrival Airport (6 cols)
├── Visa Type (6 cols)             ├── [Empty] (6 cols)
├── Entry Date (6 cols)            ├── Exit Date (6 cols)
└── Notes (12 cols full width)
```

**Validation Rules:**
- Entry date: Required
- Exit date: Optional, must be after entry date if provided
- Country codes: Must exist in countries table
- Airport codes: Max 5 characters, auto-uppercase

### StaysList
**Location:** `/components/stays/StaysList.tsx`

**Purpose:** Display list of travel records

**Features:**
- Pagination and sorting
- Edit/delete functionality
- Ongoing stay indicators
- Country flag display

## UI/UX Improvements

### Conditional Rendering Pattern

**Problem:** UI components showing when no data exists
**Solution:** Consistent conditional rendering pattern

```typescript
// Pattern 1: Simple check
if (stays.length === 0) {
  return null
}

// Pattern 2: Data-dependent check
if (stays.length === 0 || availableCountries.length === 0) {
  return null
}

// Pattern 3: Conditional wrapper
{stays.length > 0 && (
  <ComponentContent />
)}
```

**Applied to:**
- CalendarCountryFilter
- VisaWindows
- RollingCalendar stay indicators
- Dashboard CountryFilter

### Form Enhancements

#### From/To Structure
```typescript
// Old structure (single country)
{
  countryCode: 'KR',
  entryDate: '2024-08-01',
  exitDate: '2024-08-15'
}

// New structure (From/To flow)
{
  fromCountry: 'JP',        // Origin
  countryCode: 'KR',        // Destination
  entryCity: 'ICN',         // Arrival airport
  exitCity: 'NRT',          // Departure airport
  entryDate: '2024-08-01',
  exitDate: '2024-08-15',   // Optional
  visaType: 'visa-free'
}
```

#### Visa Type Integration
```typescript
// Dynamic visa type loading based on destination country
const availableVisaTypes = getAvailableVisaTypes(formData.countryCode, nationality)

// Auto-update visa type when country changes
onChange={(e) => {
  const newCountry = e.target.value
  const visaTypes = getAvailableVisaTypes(newCountry, nationality)
  setFormData({ 
    ...formData, 
    countryCode: newCountry,
    visaType: visaTypes.length > 0 ? visaTypes[0].value : ''
  })
}}
```

### Data Flow Updates

#### localStorage Integration
```typescript
// Enhanced addStayToStorage function
const newStay = addStayToStorage({
  countryCode: formData.countryCode,
  fromCountry: formData.fromCountry || undefined,
  entryDate: formData.entryDate,
  exitDate: formData.exitDate || undefined,
  entryCity: formData.entryCity || undefined,
  exitCity: formData.exitCity || undefined,
  visaType: formData.visaType,
  notes: formData.notes
})
```

#### Supabase Integration
```typescript
// Database mapping for new fields
{
  country_code: stay.countryCode,
  from_country: stay.fromCountry || null,
  entry_date: stay.entryDate,
  exit_date: stay.exitDate || null,
  entry_city: stay.entryCity || null,
  exit_city: stay.exitCity || null,
  visa_type: stay.visaType || null,
  notes: stay.notes || null
}
```

## Type Definitions

### Enhanced Stay Interface
```typescript
export interface Stay {
  id: string
  countryCode: string    // Destination country (To Country)
  fromCountry?: string   // Origin country (From Country)
  entryDate: string      // ISO date string
  exitDate?: string      // ISO date string - optional for ongoing stays
  entryCity?: string     // Arrival airport/city code (e.g., ICN, BKK)
  exitCity?: string      // Departure airport/city code
  visaType?: 'visa-free' | 'e-visa' | 'visa-on-arrival' | 'tourist-visa' | 'business-visa' | 'transit'
  notes?: string
}
```

### Helper Functions
```typescript
// Check if stay is ongoing
export function isOngoingStay(stay: Stay): boolean {
  return !stay.exitDate || stay.exitDate === ''
}

// Calculate stay duration with support for ongoing stays
export function calculateStayDuration(stay: Stay, endDate?: Date): number {
  const entryDate = new Date(stay.entryDate)
  const exitDate = stay.exitDate 
    ? new Date(stay.exitDate) 
    : endDate || new Date() // Use provided end date or today for ongoing stays
  
  const timeDiff = exitDate.getTime() - entryDate.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1
}
```

## Styling and Design

### Material Design 3 Implementation
- Uses Google Sans font family for headers
- Material Design color palette (#1a73e8 primary blue)
- Consistent spacing and elevation patterns
- Hover effects and transitions

### Responsive Design
- Grid system with breakpoints (xs: 12, md: 6)
- Mobile-first approach
- Collapsible sidebar for mobile
- Adaptive form layouts

## Testing Considerations

### Form Validation Tests
- Required field validation
- Date range validation (exit after entry)
- Airport code format validation
- Country selection validation

### Conditional Rendering Tests
- Empty state handling
- Data-dependent component visibility
- Loading state management
- Error state handling

### Data Flow Tests
- localStorage persistence
- Supabase synchronization
- Form submission handling
- Real-time updates

## Future Enhancements

### Planned Improvements
1. **Airport Code Autocomplete**: Integration with airport database
2. **Travel Timeline View**: Visual representation of travel history
3. **Bulk Import**: CSV/Excel import functionality
4. **Advanced Filtering**: Multi-criteria search and filtering
5. **Travel Statistics**: Analytics and insights dashboard

### Component Refactoring Opportunities
1. **Form Component Abstraction**: Reusable form components
2. **Validation Hook**: Custom hook for form validation
3. **Data Fetching Hook**: Unified data loading pattern
4. **Theme Customization**: Enhanced Material Design theming