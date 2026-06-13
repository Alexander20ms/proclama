import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { createClient as createServerClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Get user from Authorization header (Bearer token)
  const headersList = headers();
  const auth = headersList.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.slice(7);

  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [walletResult, txResult] = await Promise.all([
    supabaseAdmin
      .from("billeteras")
      .select("nebulosas")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("transacciones")
      .select("id, tipo, nebulosas, descripcion, created_at, referencia_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return NextResponse.json({
    nebulosas: walletResult.data?.nebulosas ?? 0,
    transacciones: txResult.data ?? [],
  });
}
