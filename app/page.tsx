import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/HomeClient";
import type { Proclama } from "@/components/ProclamaCard";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: initial, count } = await supabase
    .from("proclamas")
    .select(
      "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total, user_id",
      { count: "exact" }
    )
    .eq("publicada", true)
    .order("monto", { ascending: false })
    .range(0, 9);

  const totalCount = count ?? 0;
  const proclamas = (initial as Proclama[]) ?? [];

  const totalReacciones = proclamas.reduce((sum, p) => {
    const r = p.reacciones ?? {};
    return sum + Object.values(r).reduce((a, b) => a + b, 0);
  }, 0);

  const hasMore = totalCount > 10;

  return (
    <HomeClient
      initialProclamaas={proclamas}
      totalCount={totalCount}
      hasMore={hasMore}
      totalReacciones={totalReacciones}
    />
  );
}
