import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SELECT_FIELDS =
  "id, texto, autor, monto, nebulosas, categoria, reacciones, created_at, apoyos, monto_total, user_id, autor_animal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(40, Math.max(1, parseInt(searchParams.get("limit") ?? "40")));
  const search = searchParams.get("q") ?? "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const offset = (page - 1) * limit;

  let query = supabase
    .from("proclamas")
    .select(SELECT_FIELDS, { count: "exact" })
    .eq("publicada", true);

  if (search) query = query.or(`texto.ilike.%${search}%,autor.ilike.%${search}%`);

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalCount = count ?? 0;

  return NextResponse.json({
    proclamas: data ?? [],
    total: totalCount,
    page,
    limit,
    hasMore: offset + (data?.length ?? 0) < totalCount,
  });
}
