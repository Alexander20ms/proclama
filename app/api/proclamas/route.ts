import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SELECT_FIELDS =
  "id, texto, autor, monto, nebulosas, categoria, reacciones, created_at, apoyos, monto_total, user_id, autor_animal";

const LIMIT = 40;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0"));
  const limit = Math.min(40, Math.max(1, parseInt(searchParams.get("limit") ?? String(LIMIT))));

  // Service role bypasses RLS — safe for read-only public data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error, count } = await supabase
    .from("proclamas")
    .select(SELECT_FIELDS, { count: "exact" })
    .eq("publicada", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[/api/proclamas] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const proclamas = data ?? [];

  return NextResponse.json({
    proclamas,
    total,
    offset,
    limit,
    hasMore: offset + proclamas.length < total,
  });
}
