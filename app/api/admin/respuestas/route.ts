import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("respuestas")
    .select("id, proclama_id, texto, autor, monto, publicada, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ respuestas: [] });
    return NextResponse.json({ error: "Error al obtener respuestas" }, { status: 500 });
  }

  return NextResponse.json({ respuestas: data });
}
