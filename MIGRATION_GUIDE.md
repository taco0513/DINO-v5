# Visa Information System Migration Guide

## Overview
This guide explains how to set up the new visa information system in your Supabase database.

## Prerequisites
- Access to your Supabase project dashboard
- Admin privileges to run SQL queries

## Migration Steps

### Step 1: Run the Migration SQL
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `/supabase/migrations/002_visa_information.sql`
4. Click "Run" to execute the migration

### Step 2: Verify Tables Created
After running the migration, verify that the following tables were created:
- `visa_information` - Main visa data table
- `visa_update_logs` - Change history tracking

### Step 3: Check Initial Data
The migration includes initial visa data for:
- South Korea (KR) - Tourist & Digital Nomad visas
- Japan (JP) - Tourist & Digital Nomad visas  
- Thailand (TH) - Tourist & LTR visa
- Vietnam (VN) - Tourist visa

### Step 4: Test the Application
1. Navigate to `/guide` in your application
2. Select different countries to view visa information
3. Verify that visa data loads correctly

## Manual SQL Execution (Alternative)

If you prefer to run the SQL manually or in parts:

```sql
-- 1. First create the visa_information table
CREATE TABLE IF NOT EXISTS visa_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  visa_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(255),
  source VARCHAR(50) CHECK (source IN ('official', 'community', 'ai_generated')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(country_code, visa_type)
);

-- 2. Create the visa_update_logs table
CREATE TABLE IF NOT EXISTS visa_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  visa_type VARCHAR(50),
  change_type VARCHAR(50) CHECK (change_type IN ('create', 'update', 'delete', 'verify')),
  old_data JSONB,
  new_data JSONB,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- 3. Create indexes
CREATE INDEX idx_visa_information_country ON visa_information(country_code);
CREATE INDEX idx_visa_information_type ON visa_information(visa_type);
CREATE INDEX idx_visa_information_verified ON visa_information(is_verified);
CREATE INDEX idx_visa_update_logs_country ON visa_update_logs(country_code);
CREATE INDEX idx_visa_update_logs_changed_at ON visa_update_logs(changed_at DESC);

-- 4. Enable RLS
ALTER TABLE visa_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_update_logs ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS policies (see full migration file for all policies)
```

## Troubleshooting

### Issue: Tables not created
- Check if you have the necessary permissions
- Ensure the `countries` table exists first (it's referenced by foreign keys)

### Issue: Data not loading in app
- Check browser console for errors
- Verify RLS policies are correctly set
- Ensure your Supabase connection is configured properly

### Issue: Permission denied
- Make sure your user has the correct permissions
- Check if RLS policies are allowing read access

## Adding New Visa Data

To add visa information for a new country:

```sql
INSERT INTO visa_information (country_code, visa_type, data, source, is_verified, updated_by) 
VALUES (
  'US',  -- Country code
  'tourist',  -- Visa type
  '{
    "visaRequired": true,
    "duration": 180,
    "resetType": "rolling",
    "requirements": ["Valid passport", "DS-160 form", "Interview"],
    "fees": {
      "currency": "USD",
      "amount": 160,
      "paymentMethods": ["Credit card", "Bank transfer"]
    },
    "processingTime": {
      "min": 7,
      "max": 21
    }
  }'::jsonb,
  'official',  -- Source
  true,  -- Is verified
  'admin@example.com'  -- Updated by
);
```

## Future Enhancements

The visa information system is designed to support:
- Admin interface for easy data management
- Automated visa rule updates
- User-submitted visa information
- Multi-language support
- Visa application tracking

## Support

If you encounter any issues, please check:
1. Supabase connection settings in `.env.local`
2. Browser developer console for errors
3. Supabase logs in the dashboard