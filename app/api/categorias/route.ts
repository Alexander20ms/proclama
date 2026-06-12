import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre_es, nombre_en, emoji")
    .eq("activa", true)
    .order("nombre_es");

  if (error) {
    return NextResponse.json({ categorias: [] }, { status: 500 });
  }

  return NextResponse.json({ categorias: data ?? [] });
}
