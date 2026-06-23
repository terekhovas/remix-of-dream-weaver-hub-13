-- Grant table privileges to authenticated role (missed in initial migration)
-- Run once in Supabase SQL editor: https://supabase.com/dashboard/project/hlaceswxsenegdxwnidl/sql/new

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Also set default privileges so future tables are covered automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
