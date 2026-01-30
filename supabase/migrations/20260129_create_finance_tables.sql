-- Create Finance Tables for Granular Sync

-- 1. Finance Accounts
CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, name)
);
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own accounts" ON public.finance_accounts USING (auth.uid() = profile_id);

-- 2. Finance Portfolio
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
    theme TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.finance_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own portfolio" ON public.finance_portfolio USING (auth.uid() = profile_id);

-- 3. Finance Portfolio History
CREATE TABLE IF NOT EXISTS public.finance_portfolio_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES public.finance_portfolio(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    amount NUMERIC DEFAULT 0,
    type TEXT,
    note TEXT
);
ALTER TABLE public.finance_portfolio_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own portfolio history" ON public.finance_portfolio_history USING (auth.uid() = profile_id);

-- 4. Finance Debts
CREATE TABLE IF NOT EXISTS public.finance_debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    total NUMERIC DEFAULT 0,
    current_paid NUMERIC DEFAULT 0,
    interest NUMERIC DEFAULT 0,
    monthly_payment NUMERIC DEFAULT 0,
    next_payment_date DATE,
    icon TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.finance_debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own debts" ON public.finance_debts USING (auth.uid() = profile_id);

-- 5. Finance Debts History
CREATE TABLE IF NOT EXISTS public.finance_debts_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    debt_id UUID REFERENCES public.finance_debts(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    amount NUMERIC DEFAULT 0,
    note TEXT
);
ALTER TABLE public.finance_debts_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own debt history" ON public.finance_debts_history USING (auth.uid() = profile_id);

-- 6. Finance Reminders
CREATE TABLE IF NOT EXISTS public.finance_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    amount NUMERIC DEFAULT 0,
    day INTEGER,
    type TEXT
);
ALTER TABLE public.finance_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reminders" ON public.finance_reminders USING (auth.uid() = profile_id);

-- 7. Finance Settings
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
ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON public.finance_settings USING (auth.uid() = profile_id);

-- 8. Finance Budgets
CREATE TABLE IF NOT EXISTS public.finance_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT,
    amount NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, category)
);
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own budgets" ON public.finance_budgets USING (auth.uid() = profile_id);

-- 9. Finance Transactions
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
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON public.finance_transactions USING (auth.uid() = profile_id);

-- Grants
GRANT ALL ON public.finance_accounts TO authenticated;
GRANT ALL ON public.finance_portfolio TO authenticated;
GRANT ALL ON public.finance_portfolio_history TO authenticated;
GRANT ALL ON public.finance_debts TO authenticated;
GRANT ALL ON public.finance_debts_history TO authenticated;
GRANT ALL ON public.finance_reminders TO authenticated;
GRANT ALL ON public.finance_settings TO authenticated;
GRANT ALL ON public.finance_budgets TO authenticated;
GRANT ALL ON public.finance_transactions TO authenticated;
