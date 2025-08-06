-- DINO v4 Database Schema
-- Created for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  passport_country TEXT DEFAULT 'US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Stays table - Core feature
CREATE TABLE IF NOT EXISTS public.stays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL,
  country_name TEXT NOT NULL,
  city TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  visa_type VARCHAR(50) DEFAULT 'visa_free',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Ensure end_date is after start_date
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Visa Rules table - Store visa requirements
CREATE TABLE IF NOT EXISTS public.visa_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passport_country VARCHAR(2) NOT NULL,
  destination_country VARCHAR(2) NOT NULL,
  visa_type VARCHAR(50) NOT NULL,
  max_days INTEGER,
  period_days INTEGER, -- e.g., 90 days in 180 day period
  requires_visa BOOLEAN DEFAULT false,
  visa_on_arrival BOOLEAN DEFAULT false,
  e_visa_available BOOLEAN DEFAULT false,
  notes TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(passport_country, destination_country, visa_type)
);

-- Countries table - Reference data
CREATE TABLE IF NOT EXISTS public.countries (
  code VARCHAR(2) PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  schengen_member BOOLEAN DEFAULT false,
  tax_residency_days INTEGER DEFAULT 183,
  popular_for_nomads BOOLEAN DEFAULT false,
  emoji_flag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Visa Alerts table - Store user alerts
CREATE TABLE IF NOT EXISTS public.visa_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stay_id UUID REFERENCES public.stays(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'expiring_soon', 'overstay_risk', 'tax_residency'
  alert_date DATE NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_stays_user_id ON public.stays(user_id);
CREATE INDEX idx_stays_dates ON public.stays(start_date, end_date);
CREATE INDEX idx_stays_country ON public.stays(country_code);
CREATE INDEX idx_visa_rules_passport ON public.visa_rules(passport_country);
CREATE INDEX idx_visa_alerts_user ON public.visa_alerts(user_id, is_read);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Stays: Users can only manage their own stays
CREATE POLICY "Users can view own stays" ON public.stays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stays" ON public.stays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stays" ON public.stays
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stays" ON public.stays
  FOR DELETE USING (auth.uid() = user_id);

-- Visa Alerts: Users can only see their own alerts
CREATE POLICY "Users can view own alerts" ON public.visa_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Public read access for reference data
CREATE POLICY "Anyone can view countries" ON public.countries
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view visa rules" ON public.visa_rules
  FOR SELECT USING (true);

-- Functions
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stays_updated_at BEFORE UPDATE ON public.stays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate days in country (last 365 days)
CREATE OR REPLACE FUNCTION calculate_days_in_country(
  p_user_id UUID,
  p_country_code VARCHAR(2),
  p_check_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $$
DECLARE
  total_days INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN end_date IS NULL THEN 
        LEAST(p_check_date, CURRENT_DATE) - GREATEST(start_date, p_check_date - INTERVAL '365 days') + 1
      ELSE 
        LEAST(end_date, p_check_date) - GREATEST(start_date, p_check_date - INTERVAL '365 days') + 1
    END
  ), 0)
  INTO total_days
  FROM public.stays
  WHERE user_id = p_user_id
    AND country_code = p_country_code
    AND start_date <= p_check_date
    AND (end_date IS NULL OR end_date >= p_check_date - INTERVAL '365 days');
    
  RETURN total_days;
END;
$$ LANGUAGE plpgsql;

-- Insert sample countries data
INSERT INTO public.countries (code, name, region, schengen_member, emoji_flag, popular_for_nomads) VALUES
  ('VN', 'Vietnam', 'Southeast Asia', false, '🇻🇳', true),
  ('TH', 'Thailand', 'Southeast Asia', false, '🇹🇭', true),
  ('KR', 'South Korea', 'East Asia', false, '🇰🇷', true),
  ('JP', 'Japan', 'East Asia', false, '🇯🇵', true),
  ('ID', 'Indonesia', 'Southeast Asia', false, '🇮🇩', true),
  ('MY', 'Malaysia', 'Southeast Asia', false, '🇲🇾', true),
  ('SG', 'Singapore', 'Southeast Asia', false, '🇸🇬', true),
  ('PH', 'Philippines', 'Southeast Asia', false, '🇵🇭', true),
  ('KH', 'Cambodia', 'Southeast Asia', false, '🇰🇭', true),
  ('LA', 'Laos', 'Southeast Asia', false, '🇱🇦', true),
  ('MM', 'Myanmar', 'Southeast Asia', false, '🇲🇲', false),
  ('TW', 'Taiwan', 'East Asia', false, '🇹🇼', true),
  ('HK', 'Hong Kong', 'East Asia', false, '🇭🇰', true),
  ('CN', 'China', 'East Asia', false, '🇨🇳', false),
  ('IN', 'India', 'South Asia', false, '🇮🇳', true),
  ('MX', 'Mexico', 'North America', false, '🇲🇽', true),
  ('CO', 'Colombia', 'South America', false, '🇨🇴', true),
  ('BR', 'Brazil', 'South America', false, '🇧🇷', true),
  ('AR', 'Argentina', 'South America', false, '🇦🇷', true),
  ('PT', 'Portugal', 'Europe', true, '🇵🇹', true),
  ('ES', 'Spain', 'Europe', true, '🇪🇸', true),
  ('FR', 'France', 'Europe', true, '🇫🇷', false),
  ('DE', 'Germany', 'Europe', true, '🇩🇪', true),
  ('IT', 'Italy', 'Europe', true, '🇮🇹', false),
  ('GR', 'Greece', 'Europe', true, '🇬🇷', true),
  ('TR', 'Turkey', 'Europe/Asia', false, '🇹🇷', true),
  ('AE', 'UAE', 'Middle East', false, '🇦🇪', true),
  ('US', 'United States', 'North America', false, '🇺🇸', false),
  ('GB', 'United Kingdom', 'Europe', false, '🇬🇧', false),
  ('AU', 'Australia', 'Oceania', false, '🇦🇺', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample visa rules for US passport
INSERT INTO public.visa_rules (passport_country, destination_country, visa_type, max_days, period_days, requires_visa, visa_on_arrival, e_visa_available) VALUES
  ('US', 'VN', 'visa_free', 45, 45, false, false, false),
  ('US', 'TH', 'visa_exempt', 30, 30, false, false, false),
  ('US', 'KR', 'visa_waiver', 90, 90, false, false, false),
  ('US', 'JP', 'visa_waiver', 90, 90, false, false, false),
  ('US', 'ID', 'visa_on_arrival', 30, 30, false, true, false),
  ('US', 'MY', 'visa_free', 90, 90, false, false, false),
  ('US', 'SG', 'visa_free', 90, 90, false, false, false),
  ('US', 'PH', 'visa_free', 30, 30, false, false, false),
  ('US', 'KH', 'visa_on_arrival', 30, 30, false, true, true),
  ('US', 'LA', 'visa_on_arrival', 30, 30, false, true, false),
  ('US', 'MX', 'visa_free', 180, 180, false, false, false),
  ('US', 'CO', 'visa_free', 90, 180, false, false, false),
  ('US', 'BR', 'visa_required', 90, 90, true, false, true)
ON CONFLICT (passport_country, destination_country, visa_type) DO NOTHING;