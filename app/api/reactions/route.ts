import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMOJIS_VALIDOS = ["🔥", "❤️", "😱", "👏", "🤯"];

export async function POST(request: Request) {
  const { proclama_id, tipo } = await request.json();

  if (!proclama_id || !tipo || !EMOJIS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Leer reacciones actuales
  const { data, error: fetchError } = await supabase
    .from("proclamas")
    .select("reacciones")
    .eq("id", proclama_id)
    .eq("publicada", true)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Proclama no encontrada" }, { status: 404 });
  }

  const actuales = (data.reacciones as Record<string, number>) ?? {};
  const nuevas = { ...actuales, [tipo]: (actuales[tipo] || 0) + 1 };

  const { error: updateError } = await supabase
    .from("proclamas")
    .update({ reacciones: nuevas })
    .eq("id", proclama_id);

  if (updateError) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reacciones: nuevas });
}
