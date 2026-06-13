"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getAnimal } from "@/lib/animals";

export type Respuesta = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  created_at: string;
};

const NEBULOSAS_PRESET = [2, 4, 10, 20];

function AnimalEmoji({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const animal = getAnimal(name);
  const sz = size === "sm" ? "text-[22px]" : "text-[26px]";
  return (
    <span className={`${sz} leading-none shrink-0 select-none inline-block transition-transform duration-300 hover:scale-125`} role="img" aria-label={name}>
      {animal}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

type Props = {
  proclamaId: string;
  initialRespuestas?: Respuesta[];
};

export default function RespuestaThread({ proclamaId, initialRespuestas }: Props) {
  const { tr } = useLanguage();
  const { user, profile } = useAuth();
  const [respuestas, setRespuestas] = useState<Respuesta[]>(initialRespuestas ?? []);
  const [loading, setLoading] = useState(!initialRespuestas);
  const [showForm, setShowForm] = useState(false);
  const [saldo, setSaldo] = useState<number | null>(null);

  // Form state
  const [texto, setTexto] = useState("");
  const [nebulasSel, setNebulasSel] = useState<number | "custom">(2);
  const [customNebulas, setCustomNebulas] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialRespuestas) return;
    fetch(`/api/respuestas?proclama_id=${proclamaId}`)
      .then((r) => r.json())
      .then((d) => { setRespuestas(d.respuestas ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [proclamaId, initialRespuestas]);

  useEffect(() => {
    if (!user || !showForm) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/billetera", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setSaldo(Number(d.nebulosas));
      }
    })();
  }, [user, showForm]);

  const nebulasFinales = nebulasSel === "custom" ? parseFloat(customNebulas) || 0 : nebulasSel;
  const saldoSuficiente = saldo === null || saldo >= nebulasFinales;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || nebulasFinales < 2 || submitting || !user) return;
    setSubmitting(true);
    setFormError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setFormError("Session expired. Please log in again.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/responder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          proclama_id: proclamaId,
          texto: texto.trim(),
          nebulosas: nebulasFinales,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRespuestas((prev) => [...prev, data.respuesta]);
        setTexto("");
        setNebulasSel(2);
        setCustomNebulas("");
        setShowForm(false);
        setSaldo((s) => s !== null ? s - nebulasFinales : null);
      } else {
        setFormError(data.error ?? tr("nuevaErrorGenerico"));
      }
    } catch {
      setFormError(tr("nuevaErrorConexion"));
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-1">
      {loading ? (
        <div className="flex items-center gap-2 py-3 ml-12 text-muted text-xs">
          <span className="animate-pulse">{tr("replyLoading")}</span>
        </div>
      ) : (
        <>
          {respuestas.length > 0 && (
            <div className="relative ml-5 pl-6 border-l-2 border-line">
              {respuestas.map((r) => (
                <div key={r.id} className="flex gap-3 py-3">
                  <AnimalEmoji name={r.autor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-foreground text-sm font-semibold">{r.autor}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                        🌌 {Number(r.monto).toFixed(0)}
                      </span>
                      <span className="text-muted text-xs">{formatDate(r.created_at)}</span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">{r.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply section */}
          <div className="relative ml-5 pl-6 border-l-2 border-line pt-2 pb-3">
            <div className="absolute -left-[5px] top-4 w-[8px] h-[8px] rounded-full bg-line" />

            {!showForm ? (
              user ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-3 w-full text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-muted text-xs shrink-0">+</div>
                  <span className="text-muted text-sm group-hover:text-foreground transition-colors">
                    {tr("replyPlaceholder")}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 w-full text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-muted text-xs shrink-0">+</div>
                  <span className="text-muted text-sm group-hover:text-foreground transition-colors">
                    Login to reply with nebulas 🌌
                  </span>
                </Link>
              )
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value.slice(0, 280))}
                  placeholder={tr("replyPlaceholder")}
                  rows={3}
                  autoFocus
                  required
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-muted text-xs">
                    {profile?.username && <span className="font-semibold text-foreground">@{profile.username}</span>}
                    {saldo !== null && <span className="ml-2">· {saldo} 🌌 available</span>}
                  </span>
                  <span className={`text-xs ${texto.length >= 260 ? "text-orange-400" : "text-muted"}`}>
                    {texto.length}/280
                  </span>
                </div>

                <div>
                  <p className="text-muted text-xs mb-2">Nebulas to stake (min 2 🌌)</p>
                  <div className="flex flex-wrap gap-2">
                    {NEBULOSAS_PRESET.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNebulasSel(n)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          nebulasSel === n
                            ? "bg-accent text-white"
                            : "bg-line text-muted hover:bg-hover hover:text-foreground"
                        }`}
                      >
                        {n} 🌌
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNebulasSel("custom")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        nebulasSel === "custom"
                          ? "bg-accent text-white"
                          : "bg-line text-muted hover:bg-hover hover:text-foreground"
                      }`}
                    >
                      {tr("nuevaOtro")}
                    </button>
                  </div>
                  {nebulasSel === "custom" && (
                    <div className="mt-2">
                      <input
                        type="number"
                        value={customNebulas}
                        onChange={(e) => setCustomNebulas(e.target.value)}
                        placeholder="Min 2"
                        min="2"
                        step="1"
                        className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  )}
                </div>

                {saldo !== null && nebulasFinales >= 2 && !saldoSuficiente && (
                  <div className="flex items-center justify-between gap-2 bg-orange-900/20 border border-orange-800/50 rounded-xl px-3 py-2">
                    <p className="text-orange-400 text-xs">Insufficient nebulas</p>
                    <Link href="/billetera" className="text-accent text-xs font-bold hover:underline">Recharge</Link>
                  </div>
                )}

                {formError && <p className="text-red-400 text-xs">{formError}</p>}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setFormError(""); }}
                    className="px-4 py-2 rounded-xl text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {tr("replyCancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={!texto.trim() || nebulasFinales < 2 || !saldoSuficiente || submitting}
                    className="bg-accent text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-blue-500 transition-colors disabled:opacity-40"
                  >
                    {submitting ? tr("apoyoBtnLoading") : `Reply — ${nebulasFinales >= 2 ? nebulasFinales : 2} 🌌`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
