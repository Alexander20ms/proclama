import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { id, password } = await request.json();
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { error } = await supabase.from("respuestas").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
