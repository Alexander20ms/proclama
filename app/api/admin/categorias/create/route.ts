import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { password, nombre_es, nombre_en, emoji } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!nombre_es?.trim() || !nombre_en?.trim()) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categorias")
    .insert({ nombre_es: nombre_es.trim(), nombre_en: nombre_en.trim(), emoji: emoji || "🌍", activa: true })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }

  return NextResponse.json({ categoria: data });
}
