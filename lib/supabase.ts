import { createClient } from "@supabase/supabase-js";

// Cliente público — solo lee proclamas publicadas (respeta RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
