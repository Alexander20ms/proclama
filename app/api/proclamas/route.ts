import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SELECT_FIELDS =
  "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total, user_id";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
  const search = searchParams.get("q") ?? "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const offset = (page - 1) * limit;

  // Try RPC (gives true random + animal join). Falls back if function doesn't exist yet.
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_proclamas_random", {
    p_limit: limit,
    p_offset: offset,
    p_search: search,
  });

  if (!rpcError && rpcData) {
    const rows = (rpcData as Array<Record<string, unknown>>) ?? [];
    const totalCount = (rows[0]?.total_count as number) ?? 0;
    return NextResponse.json({
      proclamas: rows,
      total: totalCount,
      page,
      limit,
      hasMore: offset + rows.length < totalCount,
    });
  }

  // Fallback: regular query + JS shuffle (works without migration)
  let query = supabase
    .from("proclamas")
    .select(SELECT_FIELDS, { count: "exact" })
    .eq("publicada", true);

  if (search) query = query.or(`texto.ilike.%${search}%,autor.ilike.%${search}%`);

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalCount = count ?? 0;
  const rows = shuffle(data ?? []);

  return NextResponse.json({
    proclamas: rows,
    total: totalCount,
    page,
    limit,
    hasMore: offset + rows.length < totalCount,
  });
}
