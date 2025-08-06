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
  reset_type VARCHAR(20) NOT NULL,
  extension_days INTEGER,
  FOREIGN KEY (country_code) REFERENCES countries(code)
);

-- Create stays table
CREATE TABLE IF NOT EXISTS stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL,
  entry_date DATE NOT NULL,
  exit_date DATE,
  purpose VARCHAR(50) DEFAULT 'tourism',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (country_code) REFERENCES countries(code)
);

-- Insert sample countries
INSERT INTO countries (code, name, flag) VALUES
  ('KR', 'Korea', '🇰🇷'),
  ('JP', 'Japan', '🇯🇵'),
  ('TH', 'Thailand', '🇹🇭'),
  ('VN', 'Vietnam', '🇻🇳')
ON CONFLICT (code) DO NOTHING;

-- Insert visa rules for US passport holders
INSERT INTO visa_rules (country_code, max_days, period_days, reset_type, extension_days) VALUES
  ('KR', 90, 180, 'exit', 0),
  ('JP', 90, 180, 'rolling', 0),
  ('TH', 30, 180, 'exit', 30),
  ('VN', 45, 180, 'exit', 0)
ON CONFLICT (country_code) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_stays_country_code ON stays(country_code);
CREATE INDEX IF NOT EXISTS idx_stays_entry_date ON stays(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_stays_exit_date ON stays(exit_date DESC);