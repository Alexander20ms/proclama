import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: proclama, error: pError }, { data: respuestas, error: rError }] =
    await Promise.all([
      supabase
        .from("proclamas")
        .select("*")
        .eq("id", params.id)
        .eq("publicada", true)
        .single(),
      supabase
        .from("respuestas")
        .select("*")
        .eq("proclama_id", params.id)
        .eq("publicada", true)
        .order("created_at", { ascending: true }),
    ]);

  if (pError || !proclama) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (rError) {
    console.error("[/api/proclama] respuestas error:", rError);
  }

  return NextResponse.json({ proclama, respuestas: respuestas ?? [] });
}
