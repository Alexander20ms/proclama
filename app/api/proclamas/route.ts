import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const { data, error } = await supabase.rpc("get_proclamas_random", {
    p_limit: limit,
    p_offset: offset,
    p_search: search,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data as Array<Record<string, unknown>>) ?? [];
  const totalCount = (rows[0]?.total_count as number) ?? 0;

  return NextResponse.json({
    proclamas: rows,
    total: totalCount,
    page,
    limit,
    hasMore: offset + rows.length < totalCount,
  });
}
