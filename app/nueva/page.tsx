"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type Categoria = {
  id: string;
  nombre_es: string;
  nombre_en: string;
  emoji: string;
};

const MONTOS_PRESET = [1, 2, 5, 10, 20, 50];

export default function NuevaPage() {
  const { tr, lang } = useLanguage();

  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [montoSel, setMontoSel] = useState<number | "custom">(1);
  const [montoCustom, setMontoCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => {
        setCategorias(data.categorias ?? []);
        if (data.categorias?.length) setCategoriaId(data.categorias[0].id);
      });
  }, []);

  const montoFinal =
    montoSel === "custom" ? parseFloat(montoCustom) || 0 : montoSel;

  const nombreCategoria = (cat: Categoria) =>
    lang === "es" ? `${cat.emoji} ${cat.nombre_es}` : `${cat.emoji} ${cat.nombre_en}`;

  const puedeEnviar =
    texto.trim().length > 0 &&
    autor.trim().length > 0 &&
    categoriaId &&
    montoFinal >= 1 &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setLoading(true);
    setError("");

    const cat = categorias.find((c) => c.id === categoriaId);
    const categoriaNombre = cat
      ? lang === "es" ? cat.nombre_es : cat.nombre_en
      : "";

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto.trim(),
          autor: autor.trim(),
          monto: montoFinal,
          categoria: categoriaNombre,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? tr("nuevaErrorGenerico"));
        setLoading(false);
      }
    } catch {
      setError(tr("nuevaErrorConexion"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#1E1E1E]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-white hover:text-[#A0A0A0] transition-colors">
            Proclama<span className="text-[#3B82F6]">.</span>
          </Link>
          <Link href="/" className="text-[#A0A0A0] hover:text-white text-sm transition-colors">
            {tr("backToWall")}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">{tr("nuevaTitle")}</h1>
          <p className="text-[#A0A0A0] text-sm mb-8">{tr("nuevaDesc")}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Texto */}
            <div>
              <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                {tr("nuevaTextoLabel")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, 280))}
                placeholder={tr("nuevaTextoPlaceholder")}
                rows={4}
                required
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] resize-none text-lg leading-relaxed"
              />
              <div className="flex justify-end mt-1.5">
                <span className={`text-xs font-medium ${texto.length >= 260 ? "text-orange-400" : "text-[#A0A0A0]"}`}>
                  {texto.length}/280
                </span>
              </div>
            </div>

            {/* Autor */}
            <div>
              <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                {tr("nuevaAutorLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder={tr("nuevaAutorPlaceholder")}
                required
                maxLength={80}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                {tr("nuevaCatLabel")}
              </label>
              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoriaId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      categoriaId === cat.id
                        ? "bg-[#3B82F6] text-white"
                        : "bg-[#1E1E1E] text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-white"
                    }`}
                  >
                    {nombreCategoria(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                {tr("nuevaMontoLabel")} <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {MONTOS_PRESET.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMontoSel(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                      montoSel === m
                        ? "bg-[#3B82F6] text-white"
                        : "bg-[#1E1E1E] text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-white"
                    }`}
                  >
                    ${m}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMontoSel("custom")}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    montoSel === "custom"
                      ? "bg-[#3B82F6] text-white"
                      : "bg-[#1E1E1E] text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-white"
                  }`}
                >
                  {tr("nuevaOtro")}
                </button>
              </div>

              {montoSel === "custom" && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] font-semibold">$</span>
                  <input
                    type="number"
                    value={montoCustom}
                    onChange={(e) => setMontoCustom(e.target.value)}
                    placeholder={tr("nuevaMin")}
                    min="1"
                    step="1"
                    className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl pl-8 pr-4 py-3 text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                  />
                </div>
              )}

              {montoFinal >= 1 && (
                <p className="text-sm text-[#A0A0A0] mt-2">
                  {tr("nuevaMontoPays")}{" "}
                  <span className="font-bold text-[#3B82F6]">
                    ${montoFinal.toFixed(2)}
                  </span>{" "}
                  {tr("nuevaMontoUSD")}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!puedeEnviar}
              className="w-full bg-[#3B82F6] text-white font-bold py-4 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              {loading
                ? tr("nuevaBtnLoading")
                : `${tr("nuevaBtn")}${montoFinal >= 1 ? " — $" + montoFinal.toFixed(2) : ""}`}
            </button>

            <p className="text-center text-[#A0A0A0] text-xs">{tr("nuevaSecure")}</p>
          </form>
        </div>
      </main>
    </div>
  );
}
