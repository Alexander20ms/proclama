import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { password, id } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: current } = await supabase
    .from("categorias")
    .select("activa")
    .eq("id", id)
    .single();

  if (!current) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const nuevoEstado = !current.activa;

  await supabase.from("categorias").update({ activa: nuevoEstado }).eq("id", id);

  return NextResponse.json({ activa: nuevoEstado });
}
