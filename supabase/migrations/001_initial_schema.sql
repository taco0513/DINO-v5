-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flag VARCHAR(10)
);

-- Create visa_rules table
CREATE TABLE IF NOT EXISTS visa_rules (
  country_code VARCHAR(2) PRIMARY KEY,
  max_days INTEGER NOT NULL,
  period_days INTEGER NOT NULL,
  reset_type VARCHAR(20) NOT NULL CHECK (reset_type IN ('exit', 'rolling')),
  extension_days INTEGER,
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE
);

-- Create stays table
CREATE TABLE IF NOT EXISTS stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL,
  from_country VARCHAR(2),
  entry_date DATE NOT NULL,
  exit_date DATE,
  entry_city VARCHAR(5),
  exit_city VARCHAR(5),
  visa_type VARCHAR(50),
  purpose VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE,
  FOREIGN KEY (from_country) REFERENCES countries(code) ON DELETE SET NULL,
  CONSTRAINT valid_dates CHECK (exit_date IS NULL OR exit_date >= entry_date)
);

-- Insert initial data for countries
INSERT INTO countries (code, name, flag) VALUES
  ('KR', '한국', '🇰🇷'),
  ('JP', '일본', '🇯🇵'),
  ('TH', '태국', '🇹🇭'),
  ('VN', '베트남', '🇻🇳')
ON CONFLICT (code) DO NOTHING;

-- Insert visa rules for US passport holders
INSERT INTO visa_rules (country_code, max_days, period_days, reset_type, extension_days) VALUES
  ('KR', 90, 90, 'exit', NULL),
  ('JP', 90, 180, 'rolling', NULL),
  ('TH', 30, 30, 'exit', 30),
  ('VN', 45, 45, 'exit', NULL)
ON CONFLICT (country_code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stays_country_code ON stays(country_code);
CREATE INDEX IF NOT EXISTS idx_stays_entry_date ON stays(entry_date);
CREATE INDEX IF NOT EXISTS idx_stays_exit_date ON stays(exit_date);