-- FIX: Add missing constraints and columns to Finance Tables

-- 1. Fix Finance Accounts: Add Unique Constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'finance_accounts_profile_id_name_key'
    ) THEN
        ALTER TABLE public.finance_accounts ADD CONSTRAINT finance_accounts_profile_id_name_key UNIQUE (profile_id, name);
    END IF;
END $$;

-- 2. Fix Finance Portfolio: Add last_updated if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'finance_portfolio' AND column_name = 'last_updated'
    ) THEN
        ALTER TABLE public.finance_portfolio ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Fix Finance Portfolio History: Add profile_id if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'finance_portfolio_history' AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE public.finance_portfolio_history ADD COLUMN profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Fix Finance Debts: Add last_updated if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'finance_debts' AND column_name = 'last_updated'
    ) THEN
        ALTER TABLE public.finance_debts ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 5. Fix Users Table: Ensure display_name vs full_name consistency (optional, just ensuring columns exist)
-- Use full_name as the standard.

-- 6. Grant Access explicitly again to be sure
GRANT ALL ON public.finance_accounts TO authenticated;
GRANT ALL ON public.finance_portfolio TO authenticated;
GRANT ALL ON public.finance_portfolio_history TO authenticated;
GRANT ALL ON public.finance_debts TO authenticated;
GRANT ALL ON public.finance_debts_history TO authenticated;
GRANT ALL ON public.finance_reminders TO authenticated;
GRANT ALL ON public.finance_settings TO authenticated;
GRANT ALL ON public.finance_budgets TO authenticated;
GRANT ALL ON public.finance_transactions TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_data TO authenticated;
