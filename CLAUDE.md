# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DINO-v5 is a Digital Nomad visa tracking application for managing stay durations across multiple countries. It helps US passport holders track their visa compliance and remaining days in each country.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks (useState, useEffect)

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server (ALWAYS OPEN IN NEW TERMINAL)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Important Development Notes

### Server Execution
**ALWAYS open a new terminal window when running the development server.** Do not run `npm run dev` in the main terminal where code editing is happening.

### Project Structure
```
DINO-v5/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── layout.tsx     # Layout with sidebar
│   │   └── [country]/     # Dynamic country pages
│   └── api/               # API routes
├── components/            # React components
│   ├── calendar/         # Calendar components
│   └── sidebar/          # Sidebar navigation
├── lib/                   # Utilities and logic
│   ├── visa-rules/       # Visa rule engine
│   └── calculations/     # Stay duration calculations
└── supabase/             # Database schemas
```

## Visa Rules Logic

### Reset Types
1. **Simple Reset (`exit`)**: Counter resets when leaving the country (Korea, Vietnam, Thailand)
2. **Rolling Window (`rolling`)**: Days calculated within a moving window (Japan, Schengen)

### US Passport Holder Rules
- **Korea (KR)**: 90 days per entry
- **Japan (JP)**: 90 days within 180-day rolling window
- **Thailand (TH)**: 30 days per entry (extendable by 30 days)
- **Vietnam (VN)**: 45 days per entry

## Database Schema (Supabase)

```sql
-- Countries table
CREATE TABLE countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flag VARCHAR(10)
);

-- Visa rules table
CREATE TABLE visa_rules (
  country_code VARCHAR(2) PRIMARY KEY,
  max_days INTEGER NOT NULL,
  period_days INTEGER NOT NULL,
  reset_type VARCHAR(20) NOT NULL,
  extension_days INTEGER,
  FOREIGN KEY (country_code) REFERENCES countries(code)
);

-- Stays table (Enhanced with From/To structure)
CREATE TABLE stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL,          -- Destination country (To)
  from_country VARCHAR(2),                   -- Origin country (From) - nullable
  entry_date DATE NOT NULL,
  exit_date DATE,                           -- Made nullable for ongoing stays
  entry_city VARCHAR(5),                    -- Arrival airport/city code
  exit_city VARCHAR(5),                     -- Departure airport/city code
  visa_type VARCHAR(50),                    -- Type of visa used
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (country_code) REFERENCES countries(code),
  FOREIGN KEY (from_country) REFERENCES countries(code) ON DELETE SET NULL,
  CONSTRAINT valid_dates CHECK (exit_date IS NULL OR exit_date >= entry_date)
);

-- Indexes for performance
CREATE INDEX idx_stays_from_country ON stays(from_country);
CREATE INDEX idx_stays_entry_city ON stays(entry_city);
CREATE INDEX idx_stays_exit_city ON stays(exit_city);
CREATE INDEX idx_stays_visa_type ON stays(visa_type);
```

## Key Implementation Details

### From/To Travel Structure
- **From Country**: Optional origin country where traveler departed from
- **To Country**: Required destination country (stored in `country_code`)
- **Entry/Exit Cities**: Optional airport codes (e.g., ICN, BKK, NRT)
- **Visa Type**: Visa-free, e-visa, visa-on-arrival, tourist-visa, business-visa, transit
- **Ongoing Stays**: Exit date is nullable for current stays

### Stay Duration Calculation
- For rolling windows: Calculate overlap between stay dates and the rolling period
- For simple resets: Count days from most recent entry
- Always include both entry and exit dates in calculations (+1 day)
- Ongoing stays: Calculate days from entry to today

### Visual Indicators
- Green progress bar: < 60% of visa limit used
- Yellow progress bar: 60-80% of visa limit used
- Red progress bar: > 80% of visa limit used
- Warning text when < 30 days remaining

### Conditional UI Components
- Country filters only show when there are recorded stays
- Stay indicators hidden when no travel records exist
- Form validation for From/To structure and date consistency

## AI Workflow Integration

This project follows the AI Workflow Playbook methodology:
- Uses Field Proven Workflow for systematic development
- Implements SaaS Dashboard Template patterns
- Follows Context Engineering principles for clear communication