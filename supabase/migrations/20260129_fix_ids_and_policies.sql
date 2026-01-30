-- FIX IDS AND POLICIES V4 (FINAL)
-- 1. Drop Policies relying on IDs
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN 
        SELECT unnest(ARRAY[
            'finance_portfolio', 'finance_portfolio_history', 
            'finance_debts', 'finance_debts_history', 'finance_reminders', 
            'finance_transactions'
        ]) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own %I" ON public.%I', t, t);
    END LOOP;
END $$;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can manage their own portfolio" ON public.finance_portfolio;
DROP POLICY IF EXISTS "Users can manage their own portfolio history" ON public.finance_portfolio_history;
DROP POLICY IF EXISTS "Users can manage their own debts" ON public.finance_debts;
DROP POLICY IF EXISTS "Users can manage their own debts history" ON public.finance_debts_history;


-- 2. Drop Foreign Keys relying on IDs
ALTER TABLE public.finance_portfolio_history DROP CONSTRAINT IF EXISTS finance_portfolio_history_portfolio_id_fkey;
ALTER TABLE public.finance_debts_history DROP CONSTRAINT IF EXISTS finance_debts_history_debt_id_fkey;

BEGIN;
    -- 3. Alter Columns to TEXT
    -- Finance Portfolio
    ALTER TABLE public.finance_portfolio ALTER COLUMN id TYPE TEXT;
    
    -- Finance Portfolio History
    ALTER TABLE public.finance_portfolio_history ALTER COLUMN id TYPE TEXT;
    ALTER TABLE public.finance_portfolio_history ALTER COLUMN portfolio_id TYPE TEXT;

    -- Finance Debts
    ALTER TABLE public.finance_debts ALTER COLUMN id TYPE TEXT;

    -- Finance Debts History
    ALTER TABLE public.finance_debts_history ALTER COLUMN id TYPE TEXT;
    ALTER TABLE public.finance_debts_history ALTER COLUMN debt_id TYPE TEXT;

    -- Finance Reminders
    ALTER TABLE public.finance_reminders ALTER COLUMN id TYPE TEXT;

    -- Finance Transactions
    ALTER TABLE public.finance_transactions ALTER COLUMN id TYPE TEXT;
COMMIT;

-- 4. Re-create Foreign Keys (pointing to TEXT columns)
ALTER TABLE public.finance_portfolio_history 
    ADD CONSTRAINT finance_portfolio_history_portfolio_id_fkey 
    FOREIGN KEY (portfolio_id) REFERENCES public.finance_portfolio(id) ON DELETE CASCADE;

ALTER TABLE public.finance_debts_history 
    ADD CONSTRAINT finance_debts_history_debt_id_fkey 
    FOREIGN KEY (debt_id) REFERENCES public.finance_debts(id) ON DELETE CASCADE;


-- 5. Re-create Policies (Clean & Uniform)
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN 
        SELECT unnest(ARRAY[
            'finance_portfolio', 'finance_portfolio_history', 
            'finance_debts', 'finance_debts_history', 'finance_reminders', 
            'finance_transactions'
        ]) 
    LOOP
        EXECUTE format('CREATE POLICY "Users can manage own %I" ON public.%I USING (auth.uid() = profile_id)', t, t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t);
    END LOOP;
END $$;

-- 6. FIX USERS RLS POLICIES (INSERT)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK ( auth.uid() = id );
GRANT INSERT ON public.users TO authenticated;
