import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import ProclamaCard from "@/components/ProclamaCard";

export const revalidate = 0;

type Proclama = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  categoria: string;
  created_at: string;
};

async function getProclamAs(): Promise<Proclama[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("proclamas")
    .select("id, texto, autor, monto, categoria, created_at")
    .eq("publicada", true)
    .order("monto", { ascending: false });

  if (error) {
    console.error("Error fetching proclamas:", error);
    return [];
  }
  return (data as Proclama[]) || [];
}

export default async function Home() {
  const proclamas = await getProclamAs();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#534AB7] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Proclama
              </h1>
              <p className="text-purple-200 mt-1 text-lg">
                Tu creencia vale más que un tweet
              </p>
            </div>
            <Link
              href="/nueva"
              className="bg-white text-[#534AB7] font-bold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors whitespace-nowrap shadow-lg text-base"
            >
              📣 Publicar mi proclama
            </Link>
          </div>
        </div>
      </header>

      {/* Muro */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        {proclamas.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm font-medium">
                {proclamas.length} proclama{proclamas.length !== 1 ? "s" : ""} publicada{proclamas.length !== 1 ? "s" : ""}
              </p>
              <p className="text-gray-400 text-xs">Ordenado por monto ↓</p>
            </div>
            <div className="space-y-4">
              {proclamas.map((p) => (
                <ProclamaCard key={p.id} proclama={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-6xl mb-5">📣</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              El muro está vacío
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              ¡Sé la primera persona en proclamar algo al mundo!
            </p>
            <Link
              href="/nueva"
              className="bg-[#534AB7] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#3D3589] transition-colors inline-block"
            >
              Publicar mi proclama
            </Link>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs">
        Proclama — Cada palabra tiene un precio
      </footer>
    </div>
  );
}
