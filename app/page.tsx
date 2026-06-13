import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/HomeClient";
import type { Proclama } from "@/components/ProclamaCard";

export const revalidate = 0;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let proclamas: Proclama[] = [];
  let totalCount = 0;

  // Try RPC first (true random + animal join)
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_proclamas_random", {
    p_limit: 10,
    p_offset: 0,
    p_search: "",
  });

  if (!rpcError && rpcData && (rpcData as unknown[]).length > 0) {
    const rows = rpcData as unknown as Proclama[];
    totalCount = (rows[0] as Record<string, unknown>)?.total_count as number ?? 0;
    proclamas = rows;
  } else {
    // Fallback: regular query + JS shuffle
    const { data, count } = await supabase
      .from("proclamas")
      .select(
        "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total, user_id",
        { count: "exact" }
      )
      .eq("publicada", true)
      .order("created_at", { ascending: false })
      .range(0, 9);

    totalCount = count ?? 0;
    proclamas = shuffle((data as Proclama[]) ?? []);
  }

  const hasMore = totalCount > 10;
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
