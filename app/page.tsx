import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/HomeClient";
import type { Proclama } from "@/components/ProclamaCard";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase.rpc("get_proclamas_random", {
    p_limit: 10,
    p_offset: 0,
    p_search: "",
  });

  const rows = (data as Array<Record<string, unknown>>) ?? [];
  const totalCount = (rows[0]?.total_count as number) ?? 0;
  const proclamas = rows as unknown as Proclama[];
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
