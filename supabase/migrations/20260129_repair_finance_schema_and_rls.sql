-- COMPREHENSIVE REPAIR SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX ALL ERRORS

-- 1. FIX INFINITE RECURSION IN USERS TABLE
-- We create a secure function to check admin status without triggering RLS loops
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER bypasses RLS for this function

-- Drop problematic policies if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;

-- Re-create Admin policies using the safe function
CREATE POLICY "Admins can view all profiles"
  ON public.users FOR SELECT
  USING ( public.check_is_admin() );

CREATE POLICY "Admins can update all profiles"
  ON public.users FOR UPDATE
  USING ( public.check_is_admin() );


-- 2. CREATE MISSING TABLES & FIX COLUMNS

-- Finance Accounts
CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Fix Constraint
DO $$ BEGIN
    ALTER TABLE public.finance_accounts ADD CONSTRAINT finance_accounts_profile_id_name_key UNIQUE (profile_id, name);
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN duplicate_table THEN NULL;
END $$;

-- Finance Portfolio
CREATE TABLE IF NOT EXISTS public.finance_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT,
    subtype TEXT,
    key TEXT,
    name TEXT,
    icon TEXT,
    amount NUMERIC DEFAULT 0,
    target NUMERIC DEFAULT 0,
    theme TEXT
);
-- Add missing column safe check
DO $$ BEGIN
    ALTER TABLE public.finance_portfolio ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Finance Portfolio History
CREATE TABLE IF NOT EXISTS public.finance_portfolio_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.finance_portfolio(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    amount NUMERIC DEFAULT 0,
    type TEXT,
    note TEXT
);
-- Add missing column safe check
DO $$ BEGIN
    ALTER TABLE public.finance_portfolio_history ADD COLUMN profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Finance Debts
CREATE TABLE IF NOT EXISTS public.finance_debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    total NUMERIC DEFAULT 0,
    current_paid NUMERIC DEFAULT 0,
    interest NUMERIC DEFAULT 0,
    monthly_payment NUMERIC DEFAULT 0,
    next_payment_date DATE,
    icon TEXT
);
DO $$ BEGIN
    ALTER TABLE public.finance_debts ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Finance Debts History
CREATE TABLE IF NOT EXISTS public.finance_debts_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    debt_id UUID REFERENCES public.finance_debts(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    amount NUMERIC DEFAULT 0,
    note TEXT
);

-- Finance Reminders (Was missing entirely)
CREATE TABLE IF NOT EXISTS public.finance_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    amount NUMERIC DEFAULT 0,
    day INTEGER,
    type TEXT
);

-- Finance Settings (Was missing entirely)
CREATE TABLE IF NOT EXISTS public.finance_settings (
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    primary_color TEXT,
    accent_color TEXT,
    border_fx TEXT,
    radius TEXT,
    blur INTEGER DEFAULT 0,
    language TEXT,
    currency TEXT,
    wallpaper_type TEXT,
    wallpaper_value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance Budgets & Transactions (Just ensuring they exist)
CREATE TABLE IF NOT EXISTS public.finance_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT,
    amount NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
DO $$ BEGIN
    ALTER TABLE public.finance_budgets ADD CONSTRAINT finance_budgets_profile_id_category_key UNIQUE (profile_id, category);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC DEFAULT 0,
    category TEXT,
    description TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. ENABLE RLS & POLICIES FOR ALL NEW TABLES
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN 
        SELECT unnest(ARRAY[
            'finance_accounts', 'finance_portfolio', 'finance_portfolio_history', 
            'finance_debts', 'finance_debts_history', 'finance_reminders', 
            'finance_settings', 'finance_budgets', 'finance_transactions'
        ]) 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Drop existing policy to avoid error on retry
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "Users can manage own %I" ON public.%I', t, t);
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Create standard policy
        EXECUTE format('CREATE POLICY "Users can manage own %I" ON public.%I USING (auth.uid() = profile_id)', t, t);
        
        -- Grant access
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t);
    END LOOP;
END $$;

-- 4. FIX USER DATA Table (remove email reliance if any)
CREATE TABLE IF NOT EXISTS public.user_data (
    id TEXT PRIMARY KEY,
    app_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own user_data" ON public.user_data;
CREATE POLICY "Users can manage their own user_data" ON public.user_data FOR ALL USING (auth.uid()::text = split_part(id, '_', 1));
GRANT ALL ON public.user_data TO authenticated;
