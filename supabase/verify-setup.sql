-- Quick verification queries to check your database setup

-- 1. Check how many countries are loaded
SELECT COUNT(*) as country_count FROM countries;

-- 2. List all countries (should be 40+)
SELECT code, name, flag FROM countries ORDER BY name;

-- 3. Check visa rules count
SELECT COUNT(*) as visa_rules_count FROM visa_rules;

-- 4. Check stays table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'stays'
ORDER BY ordinal_position;

-- 5. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('stays', 'countries', 'visa_rules');

-- 6. Check indexes
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE tablename = 'stays'
ORDER BY indexname;