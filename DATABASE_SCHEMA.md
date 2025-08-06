# Database Schema Documentation

This document describes the database schema for DINO-v5, including recent updates for the From/To travel structure.

## Schema Overview

The DINO-v5 application uses Supabase (PostgreSQL) with three main tables:
- `countries`: Country reference data
- `visa_rules`: Visa regulations by country
- `stays`: Travel records with enhanced From/To structure

## Tables

### Countries Table
```sql
CREATE TABLE countries (
  code VARCHAR(2) PRIMARY KEY,      -- ISO 3166-1 alpha-2 country code
  name VARCHAR(100) NOT NULL,       -- Country name
  flag VARCHAR(10)                  -- Unicode flag emoji
);
```

**Sample Data:**
```sql
INSERT INTO countries (code, name, flag) VALUES 
('KR', '한국', '🇰🇷'),
('JP', '일본', '🇯🇵'),
('TH', '태국', '🇹🇭'),
('VN', '베트남', '🇻🇳');
```

### Visa Rules Table
```sql
CREATE TABLE visa_rules (
  country_code VARCHAR(2) PRIMARY KEY,     -- References countries.code
  max_days INTEGER NOT NULL,               -- Maximum allowed days
  period_days INTEGER NOT NULL,            -- Period for calculation (rolling window)
  reset_type VARCHAR(20) NOT NULL,         -- 'exit' or 'rolling'
  extension_days INTEGER,                  -- Optional extension days
  FOREIGN KEY (country_code) REFERENCES countries(code)
);
```

**Reset Types:**
- `exit`: Counter resets when leaving the country
- `rolling`: Days calculated within a moving window

**Sample Data:**
```sql
INSERT INTO visa_rules (country_code, max_days, period_days, reset_type, extension_days) VALUES
('KR', 90, 90, 'exit', NULL),           -- Korea: 90 days per entry
('JP', 90, 180, 'rolling', NULL),       -- Japan: 90 days within 180-day window
('TH', 30, 30, 'exit', 30),            -- Thailand: 30 days + 30 extension
('VN', 45, 45, 'exit', NULL);          -- Vietnam: 45 days per entry
```

### Stays Table (Enhanced)
```sql
CREATE TABLE stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL,          -- Destination country (To)
  from_country VARCHAR(2),                   -- Origin country (From) - nullable
  entry_date DATE NOT NULL,                  -- Arrival date
  exit_date DATE,                           -- Departure date (nullable for ongoing)
  entry_city VARCHAR(5),                    -- Arrival airport/city code
  exit_city VARCHAR(5),                     -- Departure airport/city code
  visa_type VARCHAR(50),                    -- Type of visa used
  notes TEXT,                               -- Optional notes
  created_at TIMESTAMP DEFAULT NOW(),       -- Record creation timestamp
  
  -- Foreign key constraints
  FOREIGN KEY (country_code) REFERENCES countries(code),
  FOREIGN KEY (from_country) REFERENCES countries(code) ON DELETE SET NULL,
  
  -- Data integrity constraints
  CONSTRAINT valid_dates CHECK (exit_date IS NULL OR exit_date >= entry_date)
);
```

**Indexes for Performance:**
```sql
CREATE INDEX idx_stays_from_country ON stays(from_country);
CREATE INDEX idx_stays_entry_city ON stays(entry_city);
CREATE INDEX idx_stays_exit_city ON stays(exit_city);
CREATE INDEX idx_stays_visa_type ON stays(visa_type);
```

## Recent Schema Changes (Migration 002)

### Added Columns
1. **from_country** (`VARCHAR(2)`): Origin country code with foreign key reference
2. **entry_city** (`VARCHAR(5)`): Arrival airport/city code (e.g., ICN, BKK)
3. **exit_city** (`VARCHAR(5)`): Departure airport/city code
4. **visa_type** (`VARCHAR(50)`): Type of visa used for entry

### Modified Columns
- **exit_date**: Changed from `NOT NULL` to nullable for ongoing stays

### Visa Types
Supported visa types:
- `visa-free`: No visa required
- `e-visa`: Electronic visa
- `visa-on-arrival`: Visa obtained at border
- `tourist-visa`: Tourist visa
- `business-visa`: Business visa
- `transit`: Transit visa

## Data Flow

### From/To Travel Structure
1. **From Country**: Optional origin country where traveler departed from
2. **To Country**: Required destination country (stored in `country_code`)
3. **Entry/Exit Cities**: Optional airport codes for detailed tracking
4. **Ongoing Stays**: Records with null `exit_date` represent current stays

### TypeScript Interface Mapping
```typescript
interface Stay {
  id: string
  countryCode: string    // → country_code
  fromCountry?: string   // → from_country
  entryDate: string      // → entry_date
  exitDate?: string      // → exit_date
  entryCity?: string     // → entry_city
  exitCity?: string      // → exit_city
  visaType?: string      // → visa_type
  notes?: string         // → notes
}
```

## Migration History

### Migration 001 (Initial Schema)
- Created `countries`, `visa_rules`, and basic `stays` tables
- Established foreign key relationships

### Migration 002 (From/To Enhancement)
- Added `from_country`, `entry_city`, `exit_city`, `visa_type` columns
- Made `exit_date` nullable for ongoing stays
- Added performance indexes
- Updated constraints for data integrity

## Usage Examples

### Add New Stay Record
```sql
INSERT INTO stays (
  country_code, from_country, entry_date, exit_date,
  entry_city, exit_city, visa_type, notes
) VALUES (
  'KR', 'JP', '2024-08-01', '2024-08-15',
  'ICN', 'NRT', 'visa-free', 'Business trip to Seoul'
);
```

### Query Ongoing Stays
```sql
SELECT s.*, c.name as country_name, c.flag
FROM stays s
JOIN countries c ON s.country_code = c.code
WHERE s.exit_date IS NULL
ORDER BY s.entry_date DESC;
```

### Calculate Stay Duration
```sql
SELECT 
  id,
  country_code,
  entry_date,
  exit_date,
  CASE 
    WHEN exit_date IS NULL THEN CURRENT_DATE - entry_date + 1
    ELSE exit_date - entry_date + 1
  END as days_stayed
FROM stays;
```

## Performance Considerations

- Indexes created on frequently queried columns
- Foreign key constraints ensure data integrity
- Nullable `exit_date` supports ongoing stay tracking
- Constraint checks prevent invalid date ranges

## Security Notes

- All foreign key relationships use `ON DELETE SET NULL` to prevent orphaned records
- Date validation ensures exit dates are not before entry dates
- Airport codes limited to 5 characters (IATA standard)
- Country codes follow ISO 3166-1 alpha-2 standard