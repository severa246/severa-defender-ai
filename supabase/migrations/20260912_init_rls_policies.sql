-- ==============================================================================
-- SEVERA AI SECURITY PLATFORM — PRODUCTION SUPABASE RLS MIGRATION
-- Migration Version: 20260912_init_rls_policies.sql
-- Security Model: Strict User-Level Isolation using auth.uid()
-- ==============================================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLE 1: USER WORKSPACE SNAPSHOTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    active_project_name TEXT DEFAULT 'my-workspace',
    active_file_name TEXT DEFAULT 'main.py',
    code TEXT,
    language TEXT DEFAULT 'python',
    project_folders JSONB DEFAULT '[]'::jsonb,
    project_files JSONB DEFAULT '[]'::jsonb,
    scan_sessions JSONB DEFAULT '[]'::jsonb,
    custom_rules JSONB DEFAULT '[]'::jsonb,
    api_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user workspace query lookups
CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id ON public.user_workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_email ON public.user_workspaces(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can SELECT own workspace" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users can INSERT own workspace" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users can UPDATE own workspace" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users can DELETE own workspace" ON public.user_workspaces;

-- RLS POLICIES FOR public.user_workspaces (Enforcing auth.uid() ownership)

CREATE POLICY "Users can SELECT own workspace"
    ON public.user_workspaces
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can INSERT own workspace"
    ON public.user_workspaces
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can UPDATE own workspace"
    ON public.user_workspaces
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can DELETE own workspace"
    ON public.user_workspaces
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ── TABLE 2: USER PROFILES & SETTINGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can SELECT own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can INSERT own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can UPDATE own profile" ON public.user_profiles;

CREATE POLICY "Users can SELECT own profile"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can INSERT own profile"
    ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can UPDATE own profile"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ── TRIGGER: AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant schema access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
