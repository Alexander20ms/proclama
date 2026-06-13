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

  const [circulacionRes, recargadasRes, gastosRes] = await Promise.all([
    // Total nebulas in circulation
    supabase.from("billeteras").select("nebulosas"),
    // Total nebulas ever recharged
    supabase
      .from("transacciones")
      .select("nebulosas")
      .eq("tipo", "recarga"),
    // Nebulas spent per user (proclama + respuesta)
    supabase
      .from("transacciones")
      .select("user_id, nebulosas, tipo")
      .in("tipo", ["proclama", "respuesta"]),
  ]);

  const totalCirculacion = (circulacionRes.data ?? []).reduce(
    (sum, b) => sum + Number(b.nebulosas),
    0
  );

  const totalRecargadas = (recargadasRes.data ?? []).reduce(
    (sum, t) => sum + Number(t.nebulosas),
    0
  );

  // Top 5 by nebulas spent (negative transactions)
  const gastosPorUsuario: Record<string, number> = {};
  for (const t of gastosRes.data ?? []) {
    const uid = t.user_id;
    gastosPorUsuario[uid] = (gastosPorUsuario[uid] ?? 0) + Math.abs(Number(t.nebulosas));
  }

  // Get usernames for top spenders
  const topUserIds = Object.entries(gastosPorUsuario)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uid]) => uid);

  const { data: topPerfiles } = await supabase
    .from("perfiles")
    .select("id, username")
    .in("id", topUserIds);

  const usernameMap: Record<string, string> = {};
  for (const p of topPerfiles ?? []) usernameMap[p.id] = p.username;

  const top5Gastadores = Object.entries(gastosPorUsuario)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uid, amount]) => ({ username: usernameMap[uid] ?? uid, nebulosas: amount }));

  return NextResponse.json({ totalCirculacion, totalRecargadas, top5Gastadores });
}
