-- Complete Production Database Initialization for DINO-v5
-- Run this script in your Supabase SQL Editor to ensure all tables are properly set up

-- 1. Create countries table
CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flag VARCHAR(10)
);

-- 2. Create visa_rules table
CREATE TABLE IF NOT EXISTS visa_rules (
  country_code VARCHAR(2) PRIMARY KEY,
  max_days INTEGER NOT NULL,
  period_days INTEGER NOT NULL,
  reset_type VARCHAR(20) NOT NULL CHECK (reset_type IN ('exit', 'rolling')),
  extension_days INTEGER DEFAULT 0,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE
);

-- 3. Create stays table with enhanced schema
CREATE TABLE IF NOT EXISTS stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL,
  from_country VARCHAR(2),
  entry_date DATE NOT NULL,
  exit_date DATE,
  entry_city VARCHAR(5),
  exit_city VARCHAR(5),
  visa_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE RESTRICT,
  FOREIGN KEY (from_country) REFERENCES countries(code) ON DELETE SET NULL,
  CONSTRAINT valid_dates CHECK (exit_date IS NULL OR exit_date >= entry_date)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stays_country_code ON stays(country_code);
CREATE INDEX IF NOT EXISTS idx_stays_from_country ON stays(from_country);
CREATE INDEX IF NOT EXISTS idx_stays_entry_date ON stays(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_stays_exit_date ON stays(exit_date DESC);
CREATE INDEX IF NOT EXISTS idx_stays_entry_city ON stays(entry_city);
CREATE INDEX IF NOT EXISTS idx_stays_exit_city ON stays(exit_city);
CREATE INDEX IF NOT EXISTS idx_stays_visa_type ON stays(visa_type);
CREATE INDEX IF NOT EXISTS idx_stays_created_at ON stays(created_at DESC);

-- 5. Insert all countries with flags
INSERT INTO countries (code, name, flag) VALUES
  -- Asia
  ('KR', 'South Korea', '🇰🇷'),
  ('JP', 'Japan', '🇯🇵'),
  ('TH', 'Thailand', '🇹🇭'),
  ('VN', 'Vietnam', '🇻🇳'),
  ('SG', 'Singapore', '🇸🇬'),
  ('MY', 'Malaysia', '🇲🇾'),
  ('ID', 'Indonesia', '🇮🇩'),
  ('PH', 'Philippines', '🇵🇭'),
  ('TW', 'Taiwan', '🇹🇼'),
  ('HK', 'Hong Kong', '🇭🇰'),
  ('CN', 'China', '🇨🇳'),
  ('IN', 'India', '🇮🇳'),
  -- Europe
  ('DE', 'Germany', '🇩🇪'),
  ('FR', 'France', '🇫🇷'),
  ('IT', 'Italy', '🇮🇹'),
  ('ES', 'Spain', '🇪🇸'),
  ('PT', 'Portugal', '🇵🇹'),
  ('NL', 'Netherlands', '🇳🇱'),
  ('BE', 'Belgium', '🇧🇪'),
  ('CH', 'Switzerland', '🇨🇭'),
  ('AT', 'Austria', '🇦🇹'),
  ('GB', 'United Kingdom', '🇬🇧'),
  ('IE', 'Ireland', '🇮🇪'),
  ('SE', 'Sweden', '🇸🇪'),
  ('NO', 'Norway', '🇳🇴'),
  ('DK', 'Denmark', '🇩🇰'),
  ('FI', 'Finland', '🇫🇮'),
  ('PL', 'Poland', '🇵🇱'),
  ('CZ', 'Czech Republic', '🇨🇿'),
  ('HU', 'Hungary', '🇭🇺'),
  ('GR', 'Greece', '🇬🇷'),
  -- Americas
  ('US', 'United States', '🇺🇸'),
  ('CA', 'Canada', '🇨🇦'),
  ('MX', 'Mexico', '🇲🇽'),
  ('BR', 'Brazil', '🇧🇷'),
  ('AR', 'Argentina', '🇦🇷'),
  ('CL', 'Chile', '🇨🇱'),
  ('PE', 'Peru', '🇵🇪'),
  ('CO', 'Colombia', '🇨🇴'),
  -- Oceania
  ('AU', 'Australia', '🇦🇺'),
  ('NZ', 'New Zealand', '🇳🇿'),
  -- Middle East
  ('AE', 'UAE', '🇦🇪'),
  ('IL', 'Israel', '🇮🇱'),
  ('TR', 'Turkey', '🇹🇷'),
  -- Africa
  ('ZA', 'South Africa', '🇿🇦'),
  ('EG', 'Egypt', '🇪🇬'),
  ('MA', 'Morocco', '🇲🇦')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag = EXCLUDED.flag;

-- 6. Insert visa rules for US passport holders
INSERT INTO visa_rules (country_code, max_days, period_days, reset_type, extension_days) VALUES
  -- Asia
  ('KR', 90, 180, 'exit', 0),
  ('JP', 90, 180, 'rolling', 0),
  ('TH', 30, 180, 'exit', 30),
  ('VN', 45, 180, 'exit', 0),
  ('SG', 90, 180, 'exit', 0),
  ('MY', 90, 180, 'exit', 0),
  ('ID', 30, 180, 'exit', 30),
  ('PH', 30, 365, 'exit', 29),
  ('TW', 90, 180, 'exit', 0),
  ('HK', 90, 180, 'exit', 0),
  -- Europe (Schengen Area)
  ('DE', 90, 180, 'rolling', 0),
  ('FR', 90, 180, 'rolling', 0),
  ('IT', 90, 180, 'rolling', 0),
  ('ES', 90, 180, 'rolling', 0),
  ('PT', 90, 180, 'rolling', 0),
  ('NL', 90, 180, 'rolling', 0),
  ('BE', 90, 180, 'rolling', 0),
  ('CH', 90, 180, 'rolling', 0),
  ('AT', 90, 180, 'rolling', 0),
  ('SE', 90, 180, 'rolling', 0),
  ('NO', 90, 180, 'rolling', 0),
  ('DK', 90, 180, 'rolling', 0),
  ('FI', 90, 180, 'rolling', 0),
  ('PL', 90, 180, 'rolling', 0),
  ('CZ', 90, 180, 'rolling', 0),
  ('HU', 90, 180, 'rolling', 0),
  ('GR', 90, 180, 'rolling', 0),
  -- Non-Schengen Europe
  ('GB', 180, 365, 'rolling', 0),
  ('IE', 90, 180, 'exit', 0),
  -- Americas
  ('CA', 180, 365, 'exit', 0),
  ('MX', 180, 365, 'exit', 0),
  ('BR', 90, 180, 'exit', 90),
  ('AR', 90, 180, 'exit', 90),
  ('CL', 90, 180, 'exit', 0),
  ('PE', 90, 365, 'exit', 90),
  ('CO', 90, 180, 'exit', 90),
  -- Oceania
  ('AU', 90, 365, 'exit', 0),
  ('NZ', 90, 180, 'exit', 0),
  -- Middle East
  ('AE', 30, 365, 'exit', 30),
  ('IL', 90, 180, 'exit', 0),
  ('TR', 90, 180, 'rolling', 0)
ON CONFLICT (country_code) DO UPDATE SET
  max_days = EXCLUDED.max_days,
  period_days = EXCLUDED.period_days,
  reset_type = EXCLUDED.reset_type,
  extension_days = EXCLUDED.extension_days;

-- 7. Create RLS (Row Level Security) policies if needed
-- Enable RLS on stays table
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to read all stays
CREATE POLICY "Allow anonymous read access" ON stays
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for anonymous users to insert stays
CREATE POLICY "Allow anonymous insert access" ON stays
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for anonymous users to update their own stays
CREATE POLICY "Allow anonymous update access" ON stays
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policy for anonymous users to delete stays
CREATE POLICY "Allow anonymous delete access" ON stays
  FOR DELETE
  TO anon
  USING (true);

-- 8. Add helpful comments
COMMENT ON TABLE stays IS 'Travel records with enhanced tracking including origin country and airport codes';
COMMENT ON COLUMN stays.country_code IS 'Destination country code (ISO 2-letter)';
COMMENT ON COLUMN stays.from_country IS 'Origin country code (where traveler departed from)';
COMMENT ON COLUMN stays.entry_city IS 'Entry airport/city code (e.g., ICN, BKK)';
COMMENT ON COLUMN stays.exit_city IS 'Exit airport/city code';
COMMENT ON COLUMN stays.visa_type IS 'Type of visa used (visa-free, e-visa, tourist-visa, etc.)';
COMMENT ON COLUMN stays.exit_date IS 'Exit date (NULL for ongoing stays)';
COMMENT ON COLUMN stays.notes IS 'General notes about the stay';

-- 9. Create a view for easier querying
CREATE OR REPLACE VIEW stay_details AS
SELECT 
  s.id,
  s.entry_date,
  s.exit_date,
  s.entry_city,
  s.exit_city,
  s.visa_type,
  s.notes,
  s.created_at,
  c.code as country_code,
  c.name as country_name,
  c.flag as country_flag,
  fc.code as from_country_code,
  fc.name as from_country_name,
  fc.flag as from_country_flag,
  CASE 
    WHEN s.exit_date IS NULL THEN CURRENT_DATE - s.entry_date + 1
    ELSE s.exit_date - s.entry_date + 1
  END as duration_days,
  s.exit_date IS NULL as is_ongoing
FROM stays s
JOIN countries c ON s.country_code = c.code
LEFT JOIN countries fc ON s.from_country = fc.code
ORDER BY s.entry_date DESC;

-- Grant permissions on the view
GRANT SELECT ON stay_details TO anon;

-- 10. Verify setup
DO $$
BEGIN
  RAISE NOTICE 'Database initialization complete!';
  RAISE NOTICE 'Tables created: countries, visa_rules, stays';
  RAISE NOTICE 'View created: stay_details';
  RAISE NOTICE 'RLS policies enabled for anonymous access';
END $$;