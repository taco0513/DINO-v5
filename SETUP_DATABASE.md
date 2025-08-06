# Database Setup Instructions

## Supabase Database Setup

The application uses Supabase for data persistence (optional - localStorage works without it).

### 1. Create Tables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - First: Copy and paste `/supabase/migrations/001_initial_schema.sql`
   - Then: Copy and paste `/supabase/migrations/002_update_stays_schema.sql`
4. Click **Run** for each migration

### 2. Enable Row Level Security (Optional but Recommended)

For public access (development):

```sql
-- Allow public read/write access to stays table (for development only)
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for stays" ON stays
  FOR ALL USING (true);

-- Allow public read access to countries and visa_rules
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for countries" ON countries
  FOR SELECT USING (true);

ALTER TABLE visa_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for visa_rules" ON visa_rules
  FOR SELECT USING (true);
```

### 3. Verify Setup

Visit `http://localhost:3000/api/test-db` in your browser. You should see:

```json
{
  "success": true,
  "message": "Database connection successful",
  "tables": {
    "countries": true,
    "stays": true,
    "visa_rules": true
  }
}
```

### Troubleshooting

If you see errors:

1. **"relation does not exist"** - The tables haven't been created. Run the SQL in `/supabase/schema.sql`

2. **"permission denied"** - Check your Supabase API keys in `.env.local`

3. **Connection errors** - Verify your Supabase URL and keys are correct

### Using Without Supabase

The app works perfectly fine with just localStorage. If you don't want to use Supabase:

1. The app will automatically fall back to localStorage
2. Data will be saved locally in your browser
3. You'll see warnings in the console (these can be ignored)

### Environment Variables

Make sure your `.env.local` file has:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```