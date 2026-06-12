import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { password, texto, autor, categoria, monto } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!texto?.trim() || !autor?.trim()) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("proclamas")
    .insert({
      texto: texto.trim().slice(0, 280),
      autor: autor.trim().slice(0, 80),
      categoria: categoria || "General",
      monto: Math.max(0, Number(monto) || 0),
      publicada: true,
      reacciones: {},
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Error al insertar" }, { status: 500 });
  }

  return NextResponse.json({ proclama: data });
}
