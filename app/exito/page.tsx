import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Proclama = {
  texto: string;
  autor: string;
  monto: number;
  categoria: string;
};

async function getProclamaBySession(
  sessionId: string
): Promise<Proclama | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("proclamas")
    .select("texto, autor, monto, categoria")
    .eq("stripe_session_id", sessionId)
    .single();

  if (error) return null;
  return data as Proclama;
}

export default async function ExitoPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  const proclama = sessionId ? await getProclamaBySession(sessionId) : null;

  const tweetText = proclama
    ? `"${proclama.texto}" — Lo proclamé públicamente en Proclama 📣`
    : "¡Acabo de publicar mi proclama en Proclama! 📣";

  const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://proclama.app";
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}&url=${encodeURIComponent(siteUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#534AB7] text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-2xl font-extrabold hover:text-purple-200 transition-colors"
          >
            Proclama
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full">
        {/* Celebración */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-5">🎉</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            ¡Tu proclama fue publicada!
          </h1>
          <p className="text-gray-500 text-lg">
            Ya está visible en el muro público para todo el mundo.
          </p>
        </div>

        {/* Card con la proclama */}
        {proclama && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <p className="text-2xl font-medium text-gray-900 leading-relaxed text-center italic">
              &ldquo;{proclama.texto}&rdquo;
            </p>
            <p className="text-center text-gray-500 mt-4 font-medium">
              — {proclama.autor}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-black text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            {/* X (Twitter) icon */}
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Compartir en X
          </a>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#534AB7] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3D3589] transition-colors"
          >
            Ver el muro →
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs">
        Proclama — Cada palabra tiene un precio
      </footer>
    </div>
  );
}
