import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("proclamas")
    .select("*")
    .eq("publicada", true)
    .order("created_at", { ascending: false })
    .range(0, 39);

  if (error) {
    console.error("[/api/proclamas] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proclamas: data ?? [] });
}
