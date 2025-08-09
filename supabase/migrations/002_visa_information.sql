-- Create visa_information table for comprehensive visa data
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

-- Create visa_update_logs table for tracking changes
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

-- Create indexes for better performance
CREATE INDEX idx_visa_information_country ON visa_information(country_code);
CREATE INDEX idx_visa_information_type ON visa_information(visa_type);
CREATE INDEX idx_visa_information_verified ON visa_information(is_verified);
CREATE INDEX idx_visa_update_logs_country ON visa_update_logs(country_code);
CREATE INDEX idx_visa_update_logs_changed_at ON visa_update_logs(changed_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE visa_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_update_logs ENABLE ROW LEVEL SECURITY;

-- Public can read verified visa information
CREATE POLICY "Public can read verified visa info" ON visa_information
  FOR SELECT
  USING (is_verified = true);

-- Authenticated users can read all visa information
CREATE POLICY "Authenticated users can read all visa info" ON visa_information
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify visa information (we'll implement admin check later)
CREATE POLICY "Admins can manage visa info" ON visa_information
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('zbrianjin@gmail.com')); -- Add admin emails here

-- Everyone can read update logs
CREATE POLICY "Public can read update logs" ON visa_update_logs
  FOR SELECT
  USING (true);

-- Only admins can create update logs
CREATE POLICY "Admins can create update logs" ON visa_update_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('zbrianjin@gmail.com'));

-- Insert initial visa data for major countries
INSERT INTO visa_information (country_code, visa_type, data, source, is_verified, updated_by) VALUES
-- South Korea
('KR', 'tourist', '{
  "visaRequired": false,
  "duration": 90,
  "resetType": "exit",
  "extension": {
    "available": false
  },
  "requirements": [
    "Valid passport (6+ months)",
    "Return ticket",
    "Proof of accommodation",
    "Sufficient funds"
  ],
  "fees": {
    "currency": "USD",
    "amount": 0,
    "paymentMethods": ["N/A"]
  },
  "processingTime": {
    "min": 0,
    "max": 0
  },
  "notes": "US passport holders can enter visa-free for 90 days"
}'::jsonb, 'official', true, 'system'),

('KR', 'digital_nomad', '{
  "available": true,
  "officialName": "Workation Visa (F-1-D)",
  "duration": 365,
  "renewable": true,
  "requirements": {
    "income": {
      "min": 65000,
      "currency": "USD",
      "period": "annual"
    },
    "employment": [
      "Remote employment contract",
      "Proof of employment for 1+ year",
      "Company registration documents"
    ],
    "insurance": [
      "Health insurance coverage in Korea",
      "Travel insurance"
    ],
    "background": [
      "Criminal background check",
      "Clean immigration record"
    ],
    "other": [
      "Proof of accommodation",
      "Bank statements (6 months)",
      "Tax returns"
    ]
  },
  "benefits": [
    "Work remotely for foreign employer",
    "Stay up to 2 years",
    "Bring family members",
    "Access to Korean banking"
  ],
  "restrictions": [
    "Cannot work for Korean companies",
    "Must maintain foreign employment",
    "Regular reporting required"
  ],
  "applicationProcess": [
    {
      "step": 1,
      "title": "Prepare Documents",
      "description": "Gather all required documents and get them apostilled",
      "documents": ["Passport", "Employment contract", "Income proof", "Criminal background check"],
      "estimatedTime": "2-3 weeks",
      "tips": ["Get documents apostilled in your home country", "Translate documents to Korean"],
      "officialLink": "https://www.visa.go.kr"
    },
    {
      "step": 2,
      "title": "Online Application",
      "description": "Submit application through K-ETA or Korean embassy",
      "documents": ["Completed application form", "All prepared documents"],
      "estimatedTime": "1 week",
      "tips": ["Double-check all information", "Keep copies of everything"]
    },
    {
      "step": 3,
      "title": "Interview",
      "description": "Attend interview at Korean embassy or consulate",
      "documents": ["Original documents", "Application confirmation"],
      "estimatedTime": "1 day",
      "tips": ["Dress professionally", "Be prepared to explain your work"]
    }
  ],
  "fees": {
    "currency": "USD",
    "amount": 100,
    "paymentMethods": ["Credit card", "Bank transfer"]
  },
  "processingTime": {
    "min": 15,
    "max": 30,
    "express": 7
  }
}'::jsonb, 'official', true, 'system'),

-- Japan
('JP', 'tourist', '{
  "visaRequired": false,
  "duration": 90,
  "periodDays": 180,
  "resetType": "rolling",
  "extension": {
    "available": true,
    "duration": 90,
    "cost": 4000,
    "requirements": ["Valid reason", "Financial proof", "Immigration office visit"]
  },
  "requirements": [
    "Valid passport",
    "Return ticket",
    "Proof of funds",
    "Accommodation details"
  ],
  "fees": {
    "currency": "USD",
    "amount": 0,
    "paymentMethods": ["N/A"]
  },
  "processingTime": {
    "min": 0,
    "max": 0
  },
  "notes": "90 days within any 180-day period"
}'::jsonb, 'official', true, 'system'),

('JP', 'digital_nomad', '{
  "available": true,
  "officialName": "Digital Nomad Visa",
  "duration": 180,
  "renewable": false,
  "requirements": {
    "income": {
      "min": 10000000,
      "currency": "JPY",
      "period": "annual"
    },
    "employment": [
      "Remote work agreement",
      "Business registration",
      "Client contracts"
    ],
    "insurance": [
      "Private health insurance (3M JPY coverage)",
      "Valid for entire stay"
    ],
    "background": [
      "No criminal record",
      "Clean visa history"
    ],
    "other": [
      "Detailed itinerary",
      "Tax residency certificate",
      "Proof of accommodation"
    ]
  },
  "benefits": [
    "6 months stay",
    "Spouse/children can accompany",
    "Multiple entries allowed",
    "No Japanese income tax"
  ],
  "restrictions": [
    "Cannot work for Japanese companies",
    "Cannot renew (must leave and reapply)",
    "Must maintain foreign income source"
  ],
  "fees": {
    "currency": "JPY",
    "amount": 3000,
    "paymentMethods": ["Cash", "Revenue stamp"]
  },
  "processingTime": {
    "min": 10,
    "max": 20
  }
}'::jsonb, 'official', true, 'system'),

-- Thailand
('TH', 'tourist', '{
  "visaRequired": false,
  "duration": 30,
  "resetType": "exit",
  "extension": {
    "available": true,
    "duration": 30,
    "cost": 1900,
    "requirements": ["TM.7 form", "Passport photos", "1900 THB fee", "Visit immigration office"]
  },
  "requirements": [
    "Valid passport (6+ months)",
    "Proof of funds (20,000 THB cash)",
    "Proof of onward travel",
    "Accommodation booking"
  ],
  "fees": {
    "currency": "THB",
    "amount": 0,
    "paymentMethods": ["N/A"]
  },
  "processingTime": {
    "min": 0,
    "max": 0
  },
  "notes": "Visa exemption for 30 days, extendable by 30 days"
}'::jsonb, 'official', true, 'system'),

('TH', 'digital_nomad', '{
  "available": true,
  "officialName": "Long-term Resident (LTR) Visa - Work-from-Thailand",
  "duration": 1825,
  "renewable": true,
  "requirements": {
    "income": {
      "min": 80000,
      "currency": "USD",
      "period": "annual"
    },
    "employment": [
      "Employment with public company or",
      "Private company with 3 years operation and $150M revenue",
      "Higher education degree or 5 years experience"
    ],
    "insurance": [
      "Health insurance ($50,000 coverage)",
      "Valid for entire stay"
    ],
    "background": [
      "No prohibited diseases",
      "No criminal record",
      "No visa violations"
    ],
    "other": [
      "Work for employer outside Thailand",
      "5+ years professional experience"
    ]
  },
  "benefits": [
    "5-year visa (renewable once for 10 years total)",
    "Multiple re-entry permit",
    "Digital work permit included",
    "Fast-track airport service",
    "90-day reporting extended to 1 year",
    "17% flat personal income tax"
  ],
  "restrictions": [
    "Must maintain qualifying employment",
    "Annual reporting required",
    "Cannot work for Thai companies directly"
  ],
  "fees": {
    "currency": "THB",
    "amount": 50000,
    "paymentMethods": ["Bank transfer", "Credit card"]
  },
  "processingTime": {
    "min": 20,
    "max": 30
  }
}'::jsonb, 'official', true, 'system'),

-- Vietnam
('VN', 'tourist', '{
  "visaRequired": false,
  "duration": 45,
  "resetType": "exit",
  "extension": {
    "available": true,
    "duration": 30,
    "cost": 600000,
    "requirements": ["Valid passport", "Extension application", "Immigration office visit"]
  },
  "requirements": [
    "Valid passport (6+ months)",
    "Return ticket",
    "Accommodation proof"
  ],
  "fees": {
    "currency": "VND",
    "amount": 0,
    "paymentMethods": ["N/A"]
  },
  "processingTime": {
    "min": 0,
    "max": 0
  },
  "notes": "45 days visa exemption for US passport holders"
}'::jsonb, 'official', true, 'system');

-- Add alerts for important updates
INSERT INTO visa_information (country_code, visa_type, data, source, is_verified, updated_by) VALUES
('KR', 'alerts', '{
  "alerts": [
    {
      "type": "info",
      "message": "K-ETA required for visa-free entry. Apply online before travel.",
      "validUntil": "2025-12-31"
    }
  ]
}'::jsonb, 'official', true, 'system'),

('TH', 'alerts', '{
  "alerts": [
    {
      "type": "warning",
      "message": "Proof of 20,000 THB in cash may be requested on arrival",
      "validUntil": "2025-12-31"
    },
    {
      "type": "info",
      "message": "60-day visa exemption pilot program may be available for some nationalities",
      "validUntil": "2025-03-31"
    }
  ]
}'::jsonb, 'official', true, 'system');