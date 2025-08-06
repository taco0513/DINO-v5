-- Migration to update stays table schema
-- Make exit_date nullable and add new columns for enhanced travel tracking

-- Add new columns to existing stays table
ALTER TABLE stays ADD COLUMN IF NOT EXISTS from_country VARCHAR(2);
ALTER TABLE stays ADD COLUMN IF NOT EXISTS entry_city VARCHAR(5);
ALTER TABLE stays ADD COLUMN IF NOT EXISTS exit_city VARCHAR(5);
ALTER TABLE stays ADD COLUMN IF NOT EXISTS visa_type VARCHAR(50);

-- Drop the existing constraint if it exists
ALTER TABLE stays DROP CONSTRAINT IF EXISTS valid_dates;

-- Make exit_date nullable
ALTER TABLE stays ALTER COLUMN exit_date DROP NOT NULL;

-- Add new constraint that allows NULL exit_date
ALTER TABLE stays ADD CONSTRAINT valid_dates CHECK (exit_date IS NULL OR exit_date >= entry_date);

-- Add foreign key constraint for from_country
ALTER TABLE stays ADD CONSTRAINT fk_from_country 
  FOREIGN KEY (from_country) REFERENCES countries(code) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_stays_from_country ON stays(from_country);
CREATE INDEX IF NOT EXISTS idx_stays_entry_city ON stays(entry_city);
CREATE INDEX IF NOT EXISTS idx_stays_exit_city ON stays(exit_city);
CREATE INDEX IF NOT EXISTS idx_stays_visa_type ON stays(visa_type);

-- Update schema.sql to reflect current structure
COMMENT ON TABLE stays IS 'Travel records with enhanced tracking including origin country and airport codes';
COMMENT ON COLUMN stays.from_country IS 'Origin country code (where traveler departed from)';
COMMENT ON COLUMN stays.entry_city IS 'Entry airport/city code (where traveler arrived)';
COMMENT ON COLUMN stays.exit_city IS 'Exit airport/city code (where traveler departed)';
COMMENT ON COLUMN stays.visa_type IS 'Type of visa used for entry';
COMMENT ON COLUMN stays.exit_date IS 'Exit date (NULL for ongoing stays)';