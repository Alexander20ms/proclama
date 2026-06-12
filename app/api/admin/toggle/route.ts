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

  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  // Leer estado actual
  const { data: actual, error: fetchError } = await supabase
    .from("proclamas")
    .select("publicada")
    .eq("id", id)
    .single();

  if (fetchError || !actual) {
    return NextResponse.json({ error: "Proclama no encontrada" }, { status: 404 });
  }

  const nuevoEstado = !actual.publicada;

  const { error: updateError } = await supabase
    .from("proclamas")
    .update({ publicada: nuevoEstado })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }

  return NextResponse.json({ publicada: nuevoEstado });
}
