-- ==============================================================================
-- Sync AI Agent Builder - Database Schema
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create Tables
-- ------------------------------------------------------------------------------

-- agent_workflows: Stores the visual configuration of the AI Agent
CREATE TABLE IF NOT EXISTS public.agent_workflows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    trigger_config jsonb DEFAULT '{}'::jsonb,
    persona text,
    guardrails text,
    knowledge_base text,
    react_flow_state jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- agent_conversations: Stores user conversations with the 30-message limit
CREATE TABLE IF NOT EXISTS public.agent_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL UNIQUE, -- The external ID (e.g., Facebook ID or Phone Number)
    messages jsonb DEFAULT '[]'::jsonb,
    last_message_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- agent_logs: Stores real-time operations, actions, and errors
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    level text NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- processed_webhooks: Idempotency store for incoming Meta messages
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
    mid TEXT PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Row Level Security (RLS) & Policies
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Create Policies for Authenticated Users (Admins)
-- This allows any logged-in Supabase user (the admin dashboard) to read/write these tables.
-- The webhook operates via a Service Role Key, so it will bypass RLS.

-- Policies for agent_workflows
CREATE POLICY "Admins can manage agent_workflows" ON public.agent_workflows
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for agent_conversations
CREATE POLICY "Admins can view and manage agent_conversations" ON public.agent_conversations
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for agent_logs
CREATE POLICY "Admins can view and manage agent_logs" ON public.agent_logs
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Stored Procedure (RPC) for Concurrency & Token Limit
-- ------------------------------------------------------------------------------
-- This function appends a new message to the user's conversation history safely
-- using an upsert (ON CONFLICT DO UPDATE). It also guarantees that the final array
-- never exceeds the specified p_max_messages (default 30) by slicing the oldest messages out.

CREATE OR REPLACE FUNCTION public.append_agent_message(
    p_user_id text,
    p_message jsonb,
    p_max_messages int DEFAULT 30
) RETURNS void AS $$
BEGIN
    IF p_message IS NULL OR NOT (p_message ? 'role' AND p_message ? 'content') THEN
        RAISE EXCEPTION 'Invalid message format. Must contain role and content.';
    END IF;

    INSERT INTO public.agent_conversations (user_id, messages, last_message_at, created_at)
    VALUES (
        p_user_id, 
        jsonb_build_array(p_message), 
        now(), 
        now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        messages = (
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM (
                SELECT elem
                FROM jsonb_array_elements(public.agent_conversations.messages || p_message) AS elem
                -- Calculate offset to keep only the last N items
                OFFSET greatest(
                    jsonb_array_length(public.agent_conversations.messages || p_message) - p_max_messages, 
                    0
                )
            ) sub
        ),
        last_message_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
