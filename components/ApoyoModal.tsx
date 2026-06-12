"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Proclama } from "./ProclamaCard";

const MONTOS = [1, 2, 5, 10, 25];

export default function ApoyoModal({
  proclama,
  onClose,
}: {
  proclama: Proclama;
  onClose: () => void;
}) {
  const { tr } = useLanguage();
  const [monto, setMonto] = useState<number | "custom">(1);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const montoFinal = monto === "custom" ? parseFloat(custom) || 0 : monto;

  async function handleApoyo() {
    if (montoFinal < 1 || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/apoyo-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proclama_id: proclama.id, monto: montoFinal }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-line rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-foreground font-bold text-lg">
              {tr("apoyoTitle")}
            </h2>
            <p className="text-muted text-sm mt-0.5">{tr("apoyoDesc")}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl leading-none ml-3"
          >
            ×
          </button>
        </div>

        <p className="text-foreground text-sm font-medium leading-snug italic mb-5 bg-bg rounded-xl px-4 py-3">
          &ldquo;
          {proclama.texto.length > 100
            ? proclama.texto.slice(0, 100) + "…"
            : proclama.texto}
          &rdquo;
        </p>

        {/* Amount selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MONTOS.map((m) => (
            <button
              key={m}
              onClick={() => setMonto(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                monto === m
                  ? "bg-accent text-white"
                  : "bg-line text-muted hover:bg-hover hover:text-foreground"
              }`}
            >
              ${m}
            </button>
          ))}
          <button
            onClick={() => setMonto("custom")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              monto === "custom"
                ? "bg-accent text-white"
                : "bg-line text-muted hover:bg-hover hover:text-foreground"
            }`}
          >
            +
          </button>
        </div>

        {monto === "custom" && (
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">
              $
            </span>
            <input
              type="number"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="1"
              min="1"
              step="1"
              autoFocus
              className="w-full bg-bg border border-line rounded-xl pl-8 pr-4 py-2.5 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        )}

        <button
          onClick={handleApoyo}
          disabled={montoFinal < 1 || loading}
          className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40"
        >
          {loading
            ? tr("apoyoBtnLoading")
            : `${tr("apoyoBtn2")} $${montoFinal >= 1 ? montoFinal.toFixed(2) : "1.00"}`}
        </button>
      </div>
    </div>
  );
}
