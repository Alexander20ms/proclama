import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/HomeClient";
import type { Proclama } from "@/components/ProclamaCard";

export const revalidate = 0;

async function getProclamaas(): Promise<Proclama[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("proclamas")
    .select(
      "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total"
    )
    .eq("publicada", true)
    .order("monto", { ascending: false });

  if (error) {
    console.error("Error fetching proclamas:", error);
    return [];
  }
  return (data as Proclama[]) ?? [];
}

export default async function Home() {
  const proclamas = await getProclamaas();
  const catSet: Record<string, boolean> = {};
  proclamas.forEach((p) => { if (p.categoria) catSet[p.categoria] = true; });
  const categorias = Object.keys(catSet);
  return <HomeClient proclamas={proclamas} categorias={categorias} />;
}
