"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIAS = [
  "General",
  "Humor",
  "Ciencia",
  "Opinión",
  "Deportes",
  "Entretenimiento",
];

const MONTOS_PRESET = [1, 2, 5, 10, 20, 50];

type MontoSeleccion = number | "custom";

export default function NuevaPage() {
  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("General");
  const [montoSel, setMontoSel] = useState<MontoSeleccion>(1);
  const [montoCustom, setMontoCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const montoFinal =
    montoSel === "custom" ? parseFloat(montoCustom) || 0 : montoSel;

  const puedeEnviar =
    texto.trim().length > 0 &&
    autor.trim().length > 0 &&
    montoFinal >= 1 &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto.trim(),
          autor: autor.trim(),
          monto: montoFinal,
          categoria,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Ocurrió un error. Intenta nuevamente.");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#534AB7] text-white">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-extrabold hover:text-purple-200 transition-colors"
          >
            Proclama
          </Link>
          <Link
            href="/"
            className="text-purple-200 hover:text-white text-sm transition-colors"
          >
            ← Ver el muro
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Nueva Proclama
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Escribe lo que quieres declarar al mundo. Paga mínimo $1 y quedará
            publicado para siempre en el muro.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Texto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tu proclama{" "}
                <span className="text-red-500 font-normal">*</span>
              </label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, 280))}
                placeholder="Escribe tu declaración aquí..."
                rows={4}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent resize-none text-lg leading-relaxed"
              />
              <div className="flex justify-end mt-1.5">
                <span
                  className={`text-xs font-medium ${
                    texto.length >= 260
                      ? "text-orange-500"
                      : texto.length >= 220
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  {texto.length}/280
                </span>
              </div>
            </div>

            {/* Autor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tu nombre o apodo{" "}
                <span className="text-red-500 font-normal">*</span>
              </label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Ej: María García, @usuario, Anónimo"
                required
                maxLength={80}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoria(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      categoria === cat
                        ? "bg-[#534AB7] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monto (USD){" "}
                <span className="text-red-500 font-normal">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {MONTOS_PRESET.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMontoSel(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                      montoSel === m
                        ? "bg-[#534AB7] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      ? "bg-[#534AB7] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Otro
                </button>
              </div>

              {montoSel === "custom" && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={montoCustom}
                    onChange={(e) => setMontoCustom(e.target.value)}
                    placeholder="Mínimo 1"
                    min="1"
                    step="1"
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
                  />
                </div>
              )}

              {montoFinal >= 1 && (
                <p className="text-sm text-gray-500 mt-2">
                  Pagarás{" "}
                  <span className="font-bold text-[#534AB7]">
                    ${montoFinal.toFixed(2)} USD
                  </span>{" "}
                  con tarjeta
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!puedeEnviar}
              className="w-full bg-[#534AB7] text-white font-bold py-4 rounded-xl hover:bg-[#3D3589] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
            >
              {loading
                ? "Preparando el pago..."
                : `Proclamar y pagar${montoFinal >= 1 ? " $" + montoFinal.toFixed(2) : ""}`}
            </button>

            <p className="text-center text-gray-400 text-xs">
              Pago seguro vía Stripe · Sin cuenta requerida
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
