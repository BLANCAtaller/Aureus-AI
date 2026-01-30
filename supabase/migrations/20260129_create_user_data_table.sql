-- Migration: Create user_data table for profile synchronization
-- This table stores per-user application data that syncs across devices

CREATE TABLE IF NOT EXISTS public.user_data (
    id TEXT PRIMARY KEY,
    app_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own data (id starts with their user_id)
CREATE POLICY "Users can manage their own user_data"
ON public.user_data
FOR ALL
USING (
    auth.uid()::text = split_part(id, '_', 1)
);

-- Grant access to authenticated users
GRANT ALL ON public.user_data TO authenticated;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_id ON public.user_data(id);

COMMENT ON TABLE public.user_data IS 'Stores user profile data for cross-device synchronization';
