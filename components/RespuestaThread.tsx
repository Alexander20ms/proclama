"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export type Respuesta = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  created_at: string;
};

const MONTOS = [1, 2, 5, 10];

function AnimalEmoji({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  }
  const ANIMALS = ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐙","🦋","🐧","🦄","🐺","🦝"];
  const animal = ANIMALS[Math.abs(h) % ANIMALS.length];
  const sz = size === "sm" ? "text-[22px]" : "text-[26px]";
  return (
    <span
      className={`${sz} leading-none shrink-0 select-none inline-block transition-transform duration-300 hover:scale-125`}
      role="img"
      aria-label={name}
    >
      {animal}
    </span>
  );
}

type Props = {
  proclamaId: string;
  initialRespuestas?: Respuesta[];
};

export default function RespuestaThread({ proclamaId, initialRespuestas }: Props) {
  const { tr } = useLanguage();
  const [respuestas, setRespuestas] = useState<Respuesta[]>(initialRespuestas ?? []);
  const [loading, setLoading] = useState(!initialRespuestas);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState("");
  const [monto, setMonto] = useState<number | "custom">(1);
  const [customMonto, setCustomMonto] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialRespuestas) return;
    fetch(`/api/respuestas?proclama_id=${proclamaId}`)
      .then((r) => r.json())
      .then((d) => {
        setRespuestas(d.respuestas ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [proclamaId, initialRespuestas]);

  const montoFinal = monto === "custom" ? parseFloat(customMonto) || 0 : monto;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !autor.trim() || montoFinal < 1 || submitting) return;
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/respuesta-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proclama_id: proclamaId,
          texto: texto.trim(),
          autor: autor.trim(),
          monto: montoFinal,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setFormError(data.error ?? tr("nuevaErrorGenerico"));
        setSubmitting(false);
      }
    } catch {
      setFormError(tr("nuevaErrorConexion"));
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-1">
      {/* Thread line + replies */}
      {loading ? (
        <div className="flex items-center gap-2 py-3 ml-12 text-muted text-xs">
          <span className="animate-pulse">{tr("replyLoading")}</span>
        </div>
      ) : (
        <>
          {respuestas.length > 0 && (
            <div className="relative ml-5 pl-6 border-l-2 border-line">
              {respuestas.map((r) => {
                const fecha = new Date(r.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                return (
                  <div key={r.id} className="flex gap-3 py-3">
                    <AnimalEmoji name={r.autor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-foreground text-sm font-semibold">
                          {r.autor}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                          ${r.monto.toFixed(2)}
                        </span>
                        <span className="text-muted text-xs">{fecha}</span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">
                        {r.texto}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reply form */}
          <div className="relative ml-5 pl-6 border-l-2 border-line pt-2 pb-3">
            {/* Connector dot */}
            <div className="absolute -left-[5px] top-4 w-[8px] h-[8px] rounded-full bg-line" />

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-3 w-full text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-muted text-xs shrink-0">
                  +
                </div>
                <span className="text-muted text-sm group-hover:text-foreground transition-colors">
                  {tr("replyPlaceholder")}
                </span>
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Texto */}
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value.slice(0, 280))}
                  placeholder={tr("replyPlaceholder")}
                  rows={3}
                  autoFocus
                  required
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
                <div className="flex justify-end">
                  <span className={`text-xs ${texto.length >= 260 ? "text-orange-400" : "text-muted"}`}>
                    {texto.length}/280
                  </span>
                </div>

                {/* Autor */}
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder={tr("replyAuthorPlaceholder")}
                  required
                  maxLength={80}
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />

                {/* Monto */}
                <div>
                  <p className="text-muted text-xs mb-2">{tr("replyAmountLabel")}</p>
                  <div className="flex flex-wrap gap-2">
                    {MONTOS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMonto(m)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          monto === m
                            ? "bg-accent text-white"
                            : "bg-line text-muted hover:bg-hover hover:text-foreground"
                        }`}
                      >
                        ${m}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMonto("custom")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        monto === "custom"
                          ? "bg-accent text-white"
                          : "bg-line text-muted hover:bg-hover hover:text-foreground"
                      }`}
                    >
                      {tr("nuevaOtro")}
                    </button>
                  </div>
                  {monto === "custom" && (
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        value={customMonto}
                        onChange={(e) => setCustomMonto(e.target.value)}
                        placeholder="1"
                        min="1"
                        step="1"
                        className="w-full bg-bg border border-line rounded-xl pl-7 pr-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  )}
                </div>

                {formError && (
                  <p className="text-red-400 text-xs">{formError}</p>
                )}

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
                    disabled={!texto.trim() || !autor.trim() || montoFinal < 1 || submitting}
                    className="bg-accent text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-blue-500 transition-colors disabled:opacity-40"
                  >
                    {submitting
                      ? tr("apoyoBtnLoading")
                      : `${tr("replySubmitBtn")} — $${montoFinal >= 1 ? montoFinal.toFixed(2) : "1.00"}`}
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
