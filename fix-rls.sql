-- Fix Row Level Security policies for the proclamas table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)

-- 1. Make sure RLS is enabled on the table
ALTER TABLE proclamas ENABLE ROW LEVEL SECURITY;

-- 2. Drop the old policy if it exists (safe to re-run)
DROP POLICY IF EXISTS "Cualquiera puede ver proclamas publicadas" ON proclamas;

-- 3. Recreate the policy so anyone (including anonymous users) can read published proclamas
CREATE POLICY "Cualquiera puede ver proclamas publicadas"
  ON proclamas
  FOR SELECT
  USING (publicada = true);

-- Verify: the API route already uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- so this policy is only needed if you ever query with the anon key directly.
