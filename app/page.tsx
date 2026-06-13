import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/HomeClient";
import type { Proclama } from "@/components/ProclamaCard";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, count } = await supabase
    .from("proclamas")
    .select(
      "id, texto, autor, monto, nebulosas, categoria, reacciones, created_at, apoyos, monto_total, user_id, autor_animal",
      { count: "exact" }
    )
    .eq("publicada", true)
    .order("created_at", { ascending: false })
    .range(0, 39);

  const totalCount = count ?? 0;
  const proclamas: Proclama[] = (data as Proclama[]) ?? [];

  const hasMore = totalCount > 40;
  const totalReacciones = proclamas.reduce((sum, p) => {
    const r = p.reacciones ?? {};
    return sum + Object.values(r).reduce((a, b) => a + b, 0);
  }, 0);

  return (
    <HomeClient
      initialProclamaas={proclamas}
      totalCount={totalCount}
      hasMore={hasMore}
      totalReacciones={totalReacciones}
    />
  );
}
