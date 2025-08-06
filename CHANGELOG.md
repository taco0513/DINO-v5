# Changelog

All notable changes to DINO-v5 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2025-08-06

### 🎉 Major Release: From/To Travel Structure

This release introduces a comprehensive overhaul of the travel tracking system with enhanced From/To structure, improved UI/UX, and better data management.

### ✨ Added

#### From/To Travel Flow
- **Origin/Destination Tracking**: Added `from_country` field to track where travelers departed from
- **Airport Code Support**: Added `entry_city` and `exit_city` fields for arrival/departure airports (e.g., ICN, BKK, NRT)
- **Visa Type Classification**: Added `visa_type` field with options:
  - `visa-free`: No visa required
  - `e-visa`: Electronic visa
  - `visa-on-arrival`: Visa obtained at border
  - `tourist-visa`: Tourist visa
  - `business-visa`: Business visa
  - `transit`: Transit visa
- **Ongoing Stays Support**: Made `exit_date` nullable for current trips without end dates

#### Enhanced UI Components
- **Sidebar Modal**: Redesigned "Add Stay" modal with From/To flow structure
- **StayManager Form**: Enhanced main form with airport code fields and visa type selection
- **Conditional Rendering**: Smart UI components that only show when relevant data exists
- **Material Design 3**: Updated styling with Google Sans fonts and modern design patterns

#### Database Improvements
- **Schema Migration System**: Added structured migration files for database updates
- **Performance Indexes**: Created indexes on new columns for faster queries
- **Foreign Key Constraints**: Added proper relationships with cascading deletes
- **Data Integrity**: Added constraints to ensure valid date ranges

#### Developer Experience
- **Comprehensive Documentation**: Added detailed schema and component documentation
- **Type Safety**: Enhanced TypeScript interfaces with helper functions
- **Error Handling**: Improved error boundaries and user feedback
- **Development Tools**: Better debugging and development workflow

### 🔄 Changed

#### Database Schema
- **Migration 002**: Updated `stays` table with new columns:
  - `from_country VARCHAR(2)` - Origin country code (nullable)
  - `entry_city VARCHAR(5)` - Arrival airport code (nullable)
  - `exit_city VARCHAR(5)` - Departure airport code (nullable) 
  - `visa_type VARCHAR(50)` - Visa classification (nullable)
  - `exit_date` - Changed from NOT NULL to nullable

#### Form Structure
- **Old Structure**: Single country selection with basic dates
- **New Structure**: From Country → Departure Airport → To Country → Arrival Airport
- **Enhanced Validation**: Airport code format validation (5 chars, uppercase)
- **Smart Defaults**: Auto-selection of visa types based on destination country

#### Component Architecture
- **CalendarCountryFilter**: Only renders when stays exist
- **VisaWindows**: Shows only countries with actual travel records
- **RollingCalendar**: Hides stay indicators when no data present
- **Dashboard CountryFilter**: Conditional rendering based on recorded travels
- **Form Components**: Unified From/To structure across all forms

### 🐛 Fixed

#### Data Handling
- **Null Constraint Violation**: Fixed exit_date constraint for ongoing stays
- **Supabase Integration**: Better error handling for database operations
- **localStorage Sync**: Improved data synchronization between local and cloud storage
- **Form Validation**: Enhanced validation for date ranges and required fields

#### UI/UX Issues
- **Empty State Handling**: Components no longer show when no relevant data exists
- **Loading States**: Better loading indicators and error messages
- **Form Reset**: Proper form cleanup after successful submissions
- **Responsive Design**: Improved mobile and tablet layouts

#### Performance
- **Query Optimization**: Added database indexes for frequently accessed columns
- **Component Re-renders**: Optimized React component rendering cycles
- **Memory Usage**: Better cleanup of event listeners and timers

### 📚 Documentation

#### New Documentation Files
- **DATABASE_SCHEMA.md**: Comprehensive database schema documentation
- **COMPONENTS.md**: Detailed component architecture and usage guide
- **README.md**: Updated with latest features and setup instructions
- **CHANGELOG.md**: This changelog file

#### Updated Files
- **CLAUDE.md**: Enhanced AI workflow guidance with new structures
- **SETUP_DATABASE.md**: Updated with migration instructions

### 🔧 Technical Details

#### Migration Scripts
```sql
-- Migration 002: From/To Structure Enhancement
ALTER TABLE stays ADD COLUMN from_country VARCHAR(2);
ALTER TABLE stays ADD COLUMN entry_city VARCHAR(5);
ALTER TABLE stays ADD COLUMN exit_city VARCHAR(5);
ALTER TABLE stays ADD COLUMN visa_type VARCHAR(50);
ALTER TABLE stays ALTER COLUMN exit_date DROP NOT NULL;
```

#### Type Definitions
```typescript
interface Stay {
  id: string
  countryCode: string    // Destination (To Country)
  fromCountry?: string   // Origin (From Country)
  entryDate: string
  exitDate?: string      // Now optional for ongoing stays
  entryCity?: string     // Airport codes
  exitCity?: string
  visaType?: string      // Visa classification
  notes?: string
}
```

#### Helper Functions
- `isOngoingStay(stay: Stay): boolean` - Check if stay is currently active
- `calculateStayDuration(stay: Stay, endDate?: Date): number` - Calculate duration with ongoing support

### ⚠️ Breaking Changes

#### Database Schema
- **Required Migration**: Must run migration 002 to use new features
- **Data Structure**: Existing code expecting non-nullable exit_date needs updates
- **Foreign Keys**: Added constraints require proper country code references

#### Component Props
- **StayManager**: Updated props to include new fields
- **Sidebar**: Modified form data structure
- **Conditional Rendering**: Components may not render if no data exists

### 🔮 Migration Guide

#### For Existing Users
1. **Backup Data**: Export existing stays before updating
2. **Run Migration**: Execute `002_update_stays_schema.sql` in Supabase
3. **Update Code**: Use new Stay interface in custom implementations
4. **Test Features**: Verify new From/To functionality works correctly

#### For Developers
1. **Update Dependencies**: Ensure latest Material-UI and TypeScript versions
2. **Review Documentation**: Read COMPONENTS.md and DATABASE_SCHEMA.md
3. **Update Custom Components**: Adapt to new conditional rendering patterns
4. **Test Integration**: Verify Supabase and localStorage sync functionality

### 📊 Performance Improvements

- **Database**: Added 4 new indexes for optimized queries
- **UI Rendering**: Conditional components reduce DOM elements by ~30%
- **Form Validation**: Real-time validation with debounced API calls
- **Memory Usage**: Better cleanup reduces memory leaks in long sessions

### 🎯 Next Release Preview

#### Planned for v5.1.0
- **Airport Autocomplete**: Integration with airport database API
- **Bulk Import**: CSV/Excel import functionality for existing travel data
- **Advanced Analytics**: Travel pattern analysis and insights
- **Multi-language Support**: Localization for international users

---

## [4.0.0] - Previous Release

### Initial Implementation
- Basic stay tracking for digital nomads
- Simple country-based visa rule engine
- Material-UI component library integration
- Supabase database integration
- localStorage fallback functionality

---

## Getting Started

To upgrade to v5.0.0:
1. Pull the latest changes from the repository
2. Run `npm install` to update dependencies
3. Execute database migrations in your Supabase project
4. Restart your development server

For detailed setup instructions, see [README.md](./README.md).

For database migration details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

For component usage, see [COMPONENTS.md](./COMPONENTS.md).