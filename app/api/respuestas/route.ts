import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const proclamaId = searchParams.get("proclama_id");

  if (!proclamaId) return NextResponse.json({ respuestas: [] });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("respuestas")
    .select("id, texto, autor, monto, created_at")
    .eq("proclama_id", proclamaId)
    .eq("publicada", true)
    .order("created_at", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      // Table doesn't exist yet
      return NextResponse.json({ respuestas: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ respuestas: data ?? [] });
}
