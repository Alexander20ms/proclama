import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
  const categoria = searchParams.get("categoria") ?? "";
  const search = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "monto";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("proclamas")
    .select(
      "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total",
      { count: "exact" }
    )
    .eq("publicada", true);

  if (categoria && categoria !== "all") query = query.eq("categoria", categoria);
  if (search) query = query.or(`texto.ilike.%${search}%,autor.ilike.%${search}%`);

  if (sort === "fecha") query = query.order("created_at", { ascending: false });
  else if (sort === "reacciones") query = query.order("created_at", { ascending: false });
  else query = query.order("monto", { ascending: false });

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    proclamas: data ?? [],
    total: count ?? 0,
    page,
    limit,
    hasMore: (from + (data?.length ?? 0)) < (count ?? 0),
  });
}
