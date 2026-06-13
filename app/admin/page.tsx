"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type Proclama = {
  id: string; texto: string; autor: string; monto: number;
  categoria: string; publicada: boolean; reacciones: Record<string, number> | null;
  stripe_session_id: string | null; created_at: string; apoyos: number; monto_total: number;
};

type Respuesta = {
  id: string; proclama_id: string; texto: string; autor: string;
  monto: number; publicada: boolean; created_at: string;
};

type Categoria = {
  id: string; nombre_es: string; nombre_en: string; emoji: string; activa: boolean;
};

type Tab = "proclamas" | "respuestas" | "gratis" | "categorias" | "stats";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-5">
      <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-foreground text-3xl font-extrabold">{value}</p>
      {sub && <p className="text-muted text-sm mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { tr, lang } = useLanguage();

  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("proclamas");

  const [proclamas, setProclamaas] = useState<Proclama[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [respuestasLoaded, setRespuestasLoaded] = useState(false);

  const [freeTexto, setFreeTexto] = useState("");
  const [freeAutor, setFreeAutor] = useState("");
  const [freeCategoria, setFreeCategoria] = useState("");
  const [freeMonto, setFreeMonto] = useState("0");
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeMsg, setFreeMsg] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [catLoaded, setCatLoaded] = useState(false);
  const [newNombreEs, setNewNombreEs] = useState("");
  const [newNombreEn, setNewNombreEn] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌍");
  const [catLoading, setCatLoading] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────
  const login = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const res = await fetch("/api/admin/proclamas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = await res.json();
      setProclamaas(data.proclamas);
      setAutenticado(true);
    } else {
      setLoginError(tr("adminWrongPass"));
    }
    setLoginLoading(false);
  }, [password, tr]);

  // ── Proclamas ──────────────────────────────────────────────────────
  async function handleDelete(id: string, texto: string) {
    if (!confirm(`${tr("adminDeleteConfirm")}\n\n"${texto.slice(0, 80)}"`)) return;
    setActionLoading(id + "-d");
    const res = await fetch("/api/admin/delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) setProclamaas((p) => p.filter((x) => x.id !== id));
    else alert(tr("adminDeleteError"));
    setActionLoading(null);
  }

  async function handleToggle(id: string) {
    setActionLoading(id + "-t");
    const res = await fetch("/api/admin/toggle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) {
      const d = await res.json();
      setProclamaas((p) => p.map((x) => (x.id === id ? { ...x, publicada: d.publicada } : x)));
    } else alert(tr("adminToggleError"));
    setActionLoading(null);
  }

  // ── Respuestas ─────────────────────────────────────────────────────
  async function loadRespuestas() {
    if (respuestasLoaded) return;
    const res = await fetch("/api/admin/respuestas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const d = await res.json();
      setRespuestas(d.respuestas);
      setRespuestasLoaded(true);
    }
  }

  async function handleRespuestaToggle(id: string) {
    setActionLoading(id + "-rt");
    const res = await fetch("/api/admin/respuestas/toggle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) {
      const d = await res.json();
      setRespuestas((r) => r.map((x) => (x.id === id ? { ...x, publicada: d.publicada } : x)));
    }
    setActionLoading(null);
  }

  async function handleRespuestaDelete(id: string) {
    if (!confirm("¿Eliminar esta respuesta permanentemente?")) return;
    setActionLoading(id + "-rd");
    const res = await fetch("/api/admin/respuestas/delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) setRespuestas((r) => r.filter((x) => x.id !== id));
    setActionLoading(null);
  }

  // ── Free ───────────────────────────────────────────────────────────
  async function handleFree(e: React.FormEvent) {
    e.preventDefault();
    setFreeLoading(true);
    setFreeMsg("");
    const res = await fetch("/api/admin/free", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password, texto: freeTexto.trim(), autor: freeAutor.trim(),
        categoria: freeCategoria || "General",
        monto: Math.round((parseFloat(freeMonto) || 0) * 100),
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setProclamaas((p) => [d.proclama, ...p]);
      setFreeMsg(tr("adminFreeSuccess"));
      setFreeTexto(""); setFreeAutor(""); setFreeMonto("0");
    } else {
      setFreeMsg(tr("adminFreeError"));
    }
    setFreeLoading(false);
  }

  // ── Categories ─────────────────────────────────────────────────────
  async function loadCats() {
    if (catLoaded) return;
    const res = await fetch("/api/admin/categorias", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const d = await res.json();
      setCategorias(d.categorias);
      if (d.categorias.length) setFreeCategoria(d.categorias[0].nombre_es);
      setCatLoaded(true);
    }
  }

  async function handleCatToggle(id: string) {
    const res = await fetch("/api/admin/categorias/toggle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) {
      const d = await res.json();
      setCategorias((c) => c.map((x) => (x.id === id ? { ...x, activa: d.activa } : x)));
    }
  }

  async function handleCatDelete(id: string) {
    if (!confirm(tr("adminDeleteConfirm"))) return;
    const res = await fetch("/api/admin/categorias/delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) setCategorias((c) => c.filter((x) => x.id !== id));
  }

  async function handleCatCreate(e: React.FormEvent) {
    e.preventDefault();
    setCatLoading(true);
    const res = await fetch("/api/admin/categorias/create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, nombre_es: newNombreEs, nombre_en: newNombreEn, emoji: newEmoji }),
    });
    if (res.ok) {
      const d = await res.json();
      setCategorias((c) => [...c, d.categoria]);
      setNewNombreEs(""); setNewNombreEn(""); setNewEmoji("🌍");
    }
    setCatLoading(false);
  }

  function switchTab(t: Tab) {
    setTab(t);
    if (t === "categorias" || t === "gratis") loadCats();
    if (t === "respuestas") loadRespuestas();
  }

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pub = proclamas.filter((p) => p.publicada);
    const ingresos = pub.reduce((sum, p) => sum + p.monto, 0) / 100;
    const totalReacciones = pub.reduce((sum, p) => {
      const r = p.reacciones ?? {};
      return sum + Object.values(r).reduce((a, b) => a + b, 0);
    }, 0);
    const catCounts: Record<string, number> = {};
    pub.forEach((p) => { catCounts[p.categoria] = (catCounts[p.categoria] ?? 0) + 1; });
    const catPopular = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const sorted = [...pub].sort((a, b) => b.monto - a.monto);
    const masCara = sorted[0];
    const promedio = pub.length > 0 ? ingresos / pub.length : 0;

    const autorCounts: Record<string, number> = {};
    const autorMontos: Record<string, number> = {};
    pub.forEach((p) => {
      autorCounts[p.autor] = (autorCounts[p.autor] ?? 0) + 1;
      autorMontos[p.autor] = (autorMontos[p.autor] ?? 0) + p.monto;
    });
    const top5ByCount = Object.entries(autorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const top5ByMonto = Object.entries(autorMontos).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { ingresos, pubCount: pub.length, totalReacciones, catPopular, masCara, promedio, top5ByCount, top5ByMonto };
  }, [proclamas]);

  // ─────────────────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-surface border border-line rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">🔒</p>
            <h1 className="text-2xl font-bold text-foreground">{tr("adminTitle")}</h1>
            <p className="text-muted text-sm mt-1">{tr("adminSubtitle")}</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={tr("adminPasswordPlaceholder")} required autoFocus
              className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent" />
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button type="submit" disabled={loginLoading || !password}
              className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40">
              {loginLoading ? tr("adminLoginBtnLoading") : tr("adminLoginBtn")}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link href="/" className="text-muted text-sm hover:text-foreground transition-colors">
              {tr("adminBackToWall")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pub = proclamas.filter((p) => p.publicada).length;
  const hid = proclamas.filter((p) => !p.publicada).length;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line sticky top-0 bg-bg/95 backdrop-blur z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-extrabold text-foreground">
              Proclama<span className="text-accent">.</span>
            </Link>
            <span className="bg-accent/20 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
            {tr("adminBackToWall")}
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 mb-8 w-fit flex-wrap">
          {(["proclamas", "respuestas", "gratis", "categorias", "stats"] as Tab[]).map((t) => (
            <button key={t} onClick={() => switchTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {t === "proclamas" ? tr("adminTabProclamaas")
                : t === "respuestas" ? "Respuestas"
                : t === "gratis" ? tr("adminTabFree")
                : t === "categorias" ? tr("adminTabCats")
                : tr("adminTabStats")}
            </button>
          ))}
        </div>

        {/* ── Proclamas ── */}
        {tab === "proclamas" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold text-foreground">{tr("adminProclamasTitle")} ({proclamas.length})</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-emerald-400 font-medium">{pub} {tr("adminPublished")}</span>
                <span className="text-orange-400 font-medium">{hid} {tr("adminHidden")}</span>
              </div>
            </div>
            <div className="space-y-2">
              {proclamas.map((p) => {
                const busy = actionLoading === p.id + "-d" || actionLoading === p.id + "-t";
                return (
                  <div key={p.id} className={`bg-surface border rounded-xl px-5 py-4 ${p.publicada ? "border-line" : "border-orange-900/40"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium leading-snug mb-2">&ldquo;{p.texto}&rdquo;</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="text-muted">— {p.autor}</span>
                          <span className="text-emerald-400 font-bold">${(p.monto / 100).toFixed(2)}</span>
                          <span className="text-muted">{new Date(p.created_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span className={p.publicada ? "text-emerald-400 font-medium" : "text-orange-400 font-medium"}>
                            {p.publicada ? tr("adminStatusPub") : tr("adminStatusHid")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleToggle(p.id)} disabled={busy}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 ${p.publicada ? "bg-orange-900/30 text-orange-400 hover:bg-orange-900/50" : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"}`}>
                          {actionLoading === p.id + "-t" ? "…" : p.publicada ? tr("adminHideBtn") : tr("adminShowBtn")}
                        </button>
                        <button onClick={() => handleDelete(p.id, p.texto)} disabled={busy}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-40">
                          {actionLoading === p.id + "-d" ? "…" : tr("adminDeleteBtn")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Respuestas ── */}
        {tab === "respuestas" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold text-foreground">Respuestas ({respuestas.length})</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-emerald-400">{respuestas.filter((r) => r.publicada).length} publicadas</span>
                <span className="text-orange-400">{respuestas.filter((r) => !r.publicada).length} ocultas</span>
              </div>
            </div>
            {respuestas.length === 0 ? (
              <p className="text-muted text-sm">Sin respuestas aún.</p>
            ) : (
              <div className="space-y-2">
                {respuestas.map((r) => {
                  const busy = actionLoading === r.id + "-rt" || actionLoading === r.id + "-rd";
                  return (
                    <div key={r.id} className={`bg-surface border rounded-xl px-5 py-4 ${r.publicada ? "border-line" : "border-orange-900/40"}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium leading-snug mb-2">&ldquo;{r.texto}&rdquo;</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted">— {r.autor}</span>
                            <span className="text-emerald-400 font-bold">${Number(r.monto).toFixed(2)}</span>
                            <span className="text-muted">{new Date(r.created_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <Link href={`/p/${r.proclama_id}`} className="text-accent text-xs hover:underline">
                              Ver proclama →
                            </Link>
                            <span className={r.publicada ? "text-emerald-400 font-medium" : "text-orange-400 font-medium"}>
                              {r.publicada ? "● Publicada" : "○ Oculta"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleRespuestaToggle(r.id)} disabled={busy}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 ${r.publicada ? "bg-orange-900/30 text-orange-400" : "bg-emerald-900/30 text-emerald-400"}`}>
                            {actionLoading === r.id + "-rt" ? "…" : r.publicada ? "Ocultar" : "Publicar"}
                          </button>
                          <button onClick={() => handleRespuestaDelete(r.id)} disabled={busy}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-40">
                            {actionLoading === r.id + "-rd" ? "…" : "Eliminar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Nueva Gratis ── */}
        {tab === "gratis" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">{tr("adminFreeTitle")}</h2>
            <p className="text-muted text-sm mb-6">{tr("adminFreeDesc")}</p>
            <form onSubmit={handleFree} className="bg-surface border border-line rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Texto *</label>
                <textarea value={freeTexto} onChange={(e) => setFreeTexto(e.target.value.slice(0, 280))} rows={4} required
                  className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none" />
                <p className="text-right text-xs text-muted mt-1">{freeTexto.length}/280</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Autor *</label>
                <input type="text" value={freeAutor} onChange={(e) => setFreeAutor(e.target.value)} required maxLength={80}
                  className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Categoría</label>
                <select value={freeCategoria} onChange={(e) => setFreeCategoria(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
                  {categorias.filter((c) => c.activa).map((c) => (
                    <option key={c.id} value={c.nombre_es}>{c.emoji} {lang === "es" ? c.nombre_es : c.nombre_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">{tr("adminFreeMontoLabel")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input type="number" value={freeMonto} onChange={(e) => setFreeMonto(e.target.value)} min="0" step="1"
                    className="w-full bg-bg border border-line rounded-xl pl-8 pr-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
                </div>
              </div>
              {freeMsg && <p className={`text-sm text-center font-medium ${freeMsg === tr("adminFreeSuccess") ? "text-emerald-400" : "text-red-400"}`}>{freeMsg}</p>}
              <button type="submit" disabled={freeLoading || !freeTexto.trim() || !freeAutor.trim()}
                className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40">
                {freeLoading ? tr("adminFreeBtnLoading") : tr("adminFreeBtn")}
              </button>
            </form>
          </div>
        )}

        {/* ── Categorías ── */}
        {tab === "categorias" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-6">{tr("adminCatsTitle")}</h2>
            <div className="space-y-2 mb-8">
              {categorias.map((cat) => (
                <div key={cat.id} className="bg-surface border border-line rounded-xl px-5 py-3 flex items-center gap-4">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium">{cat.nombre_es} / {cat.nombre_en}</p>
                    <span className={`text-xs font-semibold ${cat.activa ? "text-emerald-400" : "text-muted"}`}>
                      {cat.activa ? tr("adminCatsActive") : tr("adminCatsInactive")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCatToggle(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${cat.activa ? "bg-orange-900/30 text-orange-400" : "bg-emerald-900/30 text-emerald-400"}`}>
                      {cat.activa ? tr("adminCatsDeactivateBtn") : tr("adminCatsActivateBtn")}
                    </button>
                    <button onClick={() => handleCatDelete(cat.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-900/30 text-red-400 transition-colors">
                      {tr("adminCatsDeleteBtn")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-surface border border-line rounded-2xl p-6">
              <h3 className="text-foreground font-bold mb-4">{tr("adminCatsNewTitle")}</h3>
              <form onSubmit={handleCatCreate} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-muted mb-1">{tr("adminCatsEmoji")}</label>
                  <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} maxLength={4}
                    className="w-16 bg-bg border border-line rounded-xl px-3 py-2 text-foreground text-center focus:outline-none focus:ring-1 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">{tr("adminCatsNombreEs")}</label>
                  <input type="text" value={newNombreEs} onChange={(e) => setNewNombreEs(e.target.value)} required
                    className="bg-bg border border-line rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent w-36" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">{tr("adminCatsNombreEn")}</label>
                  <input type="text" value={newNombreEn} onChange={(e) => setNewNombreEn(e.target.value)} required
                    className="bg-bg border border-line rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent w-36" />
                </div>
                <button type="submit" disabled={catLoading || !newNombreEs || !newNombreEn}
                  className="bg-accent text-white font-semibold px-5 py-2 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40">
                  {catLoading ? tr("adminCatsAddBtnLoading") : tr("adminCatsAddBtn")}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        {tab === "stats" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-6">{tr("statsTitle")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <StatCard label={tr("statsTotalIngresos")} value={`$${stats.ingresos.toFixed(2)}`} />
              <StatCard label={tr("statsPublicadas")} value={String(stats.pubCount)} />
              <StatCard label={tr("statsTotalReacciones")} value={String(stats.totalReacciones)} />
              <StatCard label={tr("statsCatPopular")} value={stats.catPopular} />
              <StatCard label={tr("statsPromedio")} value={`$${stats.promedio.toFixed(2)}`} />
              {stats.masCara && (
                <StatCard label={tr("statsMasCara")} value={`$${(stats.masCara.monto / 100).toFixed(2)}`} sub={stats.masCara.autor} />
              )}
            </div>
            {stats.masCara && (
              <div className="bg-surface border border-line rounded-2xl p-6 mb-6">
                <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">{tr("statsMasCara")}</p>
                <p className="text-foreground text-lg font-medium leading-relaxed">&ldquo;{stats.masCara.texto}&rdquo;</p>
                <p className="text-muted text-sm mt-2">— {stats.masCara.autor}</p>
              </div>
            )}

            {/* Top authors */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-surface border border-line rounded-2xl p-5">
                <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-4">Top 5 — Most active</p>
                <div className="space-y-2">
                  {stats.top5ByCount.map(([autor, count], i) => (
                    <div key={autor} className="flex items-center justify-between text-sm">
                      <span className="text-muted mr-2 w-4 text-right">{i + 1}.</span>
                      <span className="text-foreground font-medium flex-1 truncate">{autor}</span>
                      <span className="text-accent font-bold ml-2">{count} pub.</span>
                    </div>
                  ))}
                  {stats.top5ByCount.length === 0 && <p className="text-muted text-sm">No data yet.</p>}
                </div>
              </div>
              <div className="bg-surface border border-line rounded-2xl p-5">
                <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-4">Top 5 — Highest spend</p>
                <div className="space-y-2">
                  {stats.top5ByMonto.map(([autor, monto], i) => (
                    <div key={autor} className="flex items-center justify-between text-sm">
                      <span className="text-muted mr-2 w-4 text-right">{i + 1}.</span>
                      <span className="text-foreground font-medium flex-1 truncate">{autor}</span>
                      <span className="text-accent font-bold ml-2">${(monto / 100).toFixed(0)}</span>
                    </div>
                  ))}
                  {stats.top5ByMonto.length === 0 && <p className="text-muted text-sm">No data yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
