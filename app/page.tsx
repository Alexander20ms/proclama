import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/HomeClient";
import type { Proclama } from "@/components/ProclamaCard";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // First 10 proclamas + total count
  const { data: initial, count } = await supabase
    .from("proclamas")
    .select(
      "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total",
      { count: "exact" }
    )
    .eq("publicada", true)
    .order("monto", { ascending: false })
    .range(0, 9);

  // Active categories from categorias table
  const { data: catsData } = await supabase
    .from("categorias")
    .select("nombre_es, emoji")
    .eq("activa", true)
    .order("nombre_es", { ascending: true });

  const totalCount = count ?? 0;
  const proclamas = (initial as Proclama[]) ?? [];

  // Compute total reactions across all (approximate from loaded batch)
  const totalReacciones = proclamas.reduce((sum, p) => {
    const r = p.reacciones ?? {};
    return sum + Object.values(r).reduce((a, b) => a + b, 0);
  }, 0);

  const categorias = (catsData ?? []).map((c) => ({
    nombre: c.nombre_es,
    emoji: c.emoji,
  }));

  const hasMore = totalCount > 10;

  return (
    <HomeClient
      initialProclamaas={proclamas}
      totalCount={totalCount}
      hasMore={hasMore}
      categorias={categorias}
      totalReacciones={totalReacciones}
    />
  );
}
