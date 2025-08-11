-- Add any missing countries (safe to run multiple times)

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
ON CONFLICT (code) DO NOTHING;

-- Count to verify
SELECT COUNT(*) as total_countries FROM countries;