-- Manual migration file for Supabase SQL Editor
-- Run this in your Supabase project's SQL Editor

-- User reports table for visa information feedback
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Report metadata
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'duration_different',     -- "실제 받은 기간이 달라요"
    'visa_free_changed',      -- "비자 면제 상태가 변경됐어요" 
    'new_requirement',        -- "새로운 요구사항이 생겼어요"
    'extension_info',         -- "연장 정보가 틀려요"
    'fee_changed',           -- "수수료가 변경됐어요"
    'other'                  -- "기타"
  )),
  
  -- Country information
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  
  -- User experience vs app data
  user_experience TEXT NOT NULL,  -- "실제로 받은 일수/경험"
  current_app_data TEXT,         -- "앱에서 보여주는 정보"
  
  -- Travel details
  entry_date DATE,
  exit_date DATE,
  entry_airport VARCHAR(5),      -- Airport code
  exit_airport VARCHAR(5),       -- Airport code
  visa_type VARCHAR(50),         -- tourist, business, etc.
  
  -- Evidence and details
  additional_details TEXT,
  evidence_urls TEXT[],          -- Array of image/document URLs
  
  -- User information
  reported_by VARCHAR(255) NOT NULL,
  user_nationality VARCHAR(2),   -- Reporter's nationality
  
  -- Processing status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 검토 대기
    'investigating', -- 조사 중
    'verified',     -- 검증 완료
    'applied',      -- 앱에 반영됨
    'rejected',     -- 거부됨
    'duplicate'     -- 중복 신고
  )),
  
  -- Admin processing
  processed_by VARCHAR(255),
  processed_at TIMESTAMP,
  admin_notes TEXT,
  
  -- Verification
  verification_count INTEGER DEFAULT 1,  -- 같은 내용 신고 수
  confidence_score DECIMAL(3,2) DEFAULT 0.0,  -- 0.00-1.00
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin notifications for new reports
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Notification details
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'new_report',           -- 새로운 사용자 리포트
    'high_priority_report', -- 중요도 높은 리포트
    'multiple_reports',     -- 동일한 이슈 여러 신고
    'urgent_change'         -- 긴급 변경사항
  )),
  
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Related data
  related_report_id UUID REFERENCES user_reports(id),
  country_code VARCHAR(2),
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  archived_at TIMESTAMP
);

-- Data accuracy tracking by country
CREATE TABLE IF NOT EXISTS country_data_accuracy (
  country_code VARCHAR(2) PRIMARY KEY,
  
  -- Accuracy metrics
  accuracy_score DECIMAL(3,2) DEFAULT 1.0,  -- 0.00-1.00
  total_reports INTEGER DEFAULT 0,
  verified_reports INTEGER DEFAULT 0,
  last_verified_at TIMESTAMP,
  
  -- Data freshness
  last_updated_at TIMESTAMP DEFAULT NOW(),
  last_user_feedback_at TIMESTAMP,
  needs_review BOOLEAN DEFAULT FALSE,
  
  -- Crowd verification
  positive_feedback_count INTEGER DEFAULT 0,
  negative_feedback_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (country_code) REFERENCES countries(code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reports_country ON user_reports(country_code);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_type ON user_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON admin_notifications(priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);

-- Trigger to update country accuracy when reports change
CREATE OR REPLACE FUNCTION update_country_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  -- Update accuracy metrics for the country
  INSERT INTO country_data_accuracy (country_code, last_user_feedback_at)
  VALUES (NEW.country_code, NOW())
  ON CONFLICT (country_code) DO UPDATE SET
    last_user_feedback_at = NOW(),
    total_reports = country_data_accuracy.total_reports + 1,
    verified_reports = CASE 
      WHEN NEW.status = 'verified' THEN country_data_accuracy.verified_reports + 1
      ELSE country_data_accuracy.verified_reports
    END,
    needs_review = CASE
      WHEN NEW.status = 'pending' THEN TRUE
      ELSE country_data_accuracy.needs_review
    END;
  
  -- Create admin notification for new reports
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO admin_notifications (
      type,
      title,
      message,
      priority,
      related_report_id,
      country_code
    ) VALUES (
      'new_report',
      'New Visa Feedback: ' || NEW.country_name,
      'User reported: ' || LEFT(NEW.user_experience, 100) || '...',
      CASE 
        WHEN NEW.report_type IN ('visa_free_changed', 'new_requirement') THEN 'high'
        ELSE 'medium'
      END,
      NEW.id,
      NEW.country_code
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_update_country_accuracy ON user_reports;
CREATE TRIGGER trigger_update_country_accuracy
  AFTER INSERT OR UPDATE ON user_reports
  FOR EACH ROW EXECUTE FUNCTION update_country_accuracy();

-- Initialize accuracy data for existing countries
INSERT INTO country_data_accuracy (country_code)
SELECT code FROM countries
ON CONFLICT (country_code) DO NOTHING;

-- Sample data for testing (optional - comment out if not needed)
INSERT INTO user_reports (
  report_type,
  country_code,
  country_name,
  user_experience,
  current_app_data,
  entry_date,
  entry_airport,
  visa_type,
  additional_details,
  reported_by,
  user_nationality
) VALUES
(
  'duration_different',
  'TH',
  'Thailand',
  'Got 45 days stamp at airport instead of 30 days',
  'App shows 30 days for tourist visa',
  '2024-08-01',
  'BKK',
  'tourist',
  'Immigration officer said policy changed in July 2024',
  'user@example.com',
  'US'
),
(
  'visa_free_changed',
  'VN',
  'Vietnam', 
  'Now requires e-visa, no more visa exemption',
  'App shows visa-free for US passport',
  '2024-07-15',
  'SGN',
  'e-visa',
  'Had to get e-visa online before arrival',
  'traveler@example.com',
  'US'
)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
GRANT ALL ON user_reports TO authenticated;
GRANT ALL ON admin_notifications TO authenticated;
GRANT ALL ON country_data_accuracy TO authenticated;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_data_accuracy ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your needs)
CREATE POLICY "Users can view all reports" ON user_reports
  FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON user_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update reports" ON user_reports
  FOR UPDATE USING (auth.email() = 'zbrianjin@gmail.com');

CREATE POLICY "Admin can view notifications" ON admin_notifications
  FOR SELECT USING (auth.email() = 'zbrianjin@gmail.com');

CREATE POLICY "Admin can update notifications" ON admin_notifications
  FOR UPDATE USING (auth.email() = 'zbrianjin@gmail.com');

CREATE POLICY "Public can view accuracy data" ON country_data_accuracy
  FOR SELECT USING (true);

-- Success message
SELECT 'Feedback system tables created successfully!' as message;