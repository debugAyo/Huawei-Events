-- ============================================================================
-- Huawei Events — grant admin access to an account
-- 1. Create the account first in Authentication -> Users (or sign up).
-- 2. Replace the email below, then run this whole file in the SQL Editor.
-- ============================================================================

update public.profiles
set is_admin = true
where email = 'REPLACE_WITH_YOUR_EMAIL@example.com';

-- Verify it worked:
select email, is_admin, created_at
from public.profiles
where is_admin = true;
