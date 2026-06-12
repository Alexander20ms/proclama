"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type Proclama = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  categoria: string;
  publicada: boolean;
  stripe_session_id: string | null;
  created_at: string;
};

type Categoria = {
  id: string;
  nombre_es: string;
  nombre_en: string;
  emoji: string;
  activa: boolean;
};

type Tab = "proclamas" | "gratis" | "categorias";

export default function AdminPage() {
  const { tr, lang } = useLanguage();

  // Auth
  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tab
  const [tab, setTab] = useState<Tab>("proclamas");

  // Proclamas
  const [proclamas, setProclamaas] = useState<Proclama[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Free proclama form
  const [freeTexto, setFreeTexto] = useState("");
  const [freeAutor, setFreeAutor] = useState("");
  const [freeCategoria, setFreeCategoria] = useState("");
  const [freeMonto, setFreeMonto] = useState("0");
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeMsg, setFreeMsg] = useState("");

  // Categories
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [catLoaded, setCatLoaded] = useState(false);
  const [newNombreEs, setNewNombreEs] = useState("");
  const [newNombreEn, setNewNombreEn] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌍");
  const [catLoading, setCatLoading] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────
  const login = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [password, tr]
  );

  // ── Proclamas actions ──────────────────────────────────────────────
  async function handleDelete(id: string, texto: string) {
    if (!confirm(`${tr("adminDeleteConfirm")}\n\n"${texto.slice(0, 80)}"`)) return;
    setActionLoading(id + "-d");
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) setProclamaas((p) => p.filter((x) => x.id !== id));
    else alert(tr("adminDeleteError"));
    setActionLoading(null);
  }

  async function handleToggle(id: string) {
    setActionLoading(id + "-t");
    const res = await fetch("/api/admin/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) {
      const d = await res.json();
      setProclamaas((p) => p.map((x) => (x.id === id ? { ...x, publicada: d.publicada } : x)));
    } else alert(tr("adminToggleError"));
    setActionLoading(null);
  }

  // ── Free proclama ──────────────────────────────────────────────────
  async function handleFree(e: React.FormEvent) {
    e.preventDefault();
    setFreeLoading(true);
    setFreeMsg("");
    const res = await fetch("/api/admin/free", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        texto: freeTexto.trim(),
        autor: freeAutor.trim(),
        categoria: freeCategoria || "General",
        monto: Math.round((parseFloat(freeMonto) || 0) * 100),
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setProclamaas((p) => [d.proclama, ...p]);
      setFreeMsg(tr("adminFreeSuccess"));
      setFreeTexto("");
      setFreeAutor("");
      setFreeMonto("0");
    } else {
      setFreeMsg(tr("adminFreeError"));
    }
    setFreeLoading(false);
  }

  // ── Categories ─────────────────────────────────────────────────────
  async function loadCats() {
    if (catLoaded) return;
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) setCategorias((c) => c.filter((x) => x.id !== id));
  }

  async function handleCatCreate(e: React.FormEvent) {
    e.preventDefault();
    setCatLoading(true);
    const res = await fetch("/api/admin/categorias/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, nombre_es: newNombreEs, nombre_en: newNombreEn, emoji: newEmoji }),
    });
    if (res.ok) {
      const d = await res.json();
      setCategorias((c) => [...c, d.categoria]);
      setNewNombreEs("");
      setNewNombreEn("");
      setNewEmoji("🌍");
    }
    setCatLoading(false);
  }

  function switchTab(t: Tab) {
    setTab(t);
    if (t === "categorias" || t === "gratis") loadCats();
  }

  // ─────────────────────────────────────────────────────────────────
  // Login screen
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">🔒</p>
            <h1 className="text-2xl font-bold text-white">{tr("adminTitle")}</h1>
            <p className="text-[#A0A0A0] text-sm mt-1">{tr("adminSubtitle")}</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tr("adminPasswordPlaceholder")}
              required
              autoFocus
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full bg-[#3B82F6] text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40"
            >
              {loginLoading ? tr("adminLoginBtnLoading") : tr("adminLoginBtn")}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link href="/" className="text-[#A0A0A0] text-sm hover:text-white transition-colors">
              {tr("adminBackToWall")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pub = proclamas.filter((p) => p.publicada).length;
  const hid = proclamas.filter((p) => !p.publicada).length;

  // ─────────────────────────────────────────────────────────────────
  // Main panel
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#1E1E1E] sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-extrabold text-white">
              Proclama<span className="text-[#3B82F6]">.</span>
            </Link>
            <span className="bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-semibold px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <Link href="/" className="text-[#A0A0A0] hover:text-white text-sm transition-colors">
            {tr("adminBackToWall")}
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#111111] border border-[#1E1E1E] rounded-xl p-1 mb-8 w-fit">
          {(["proclamas", "gratis", "categorias"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? "bg-[#3B82F6] text-white" : "text-[#A0A0A0] hover:text-white"
              }`}
            >
              {t === "proclamas" ? tr("adminTabProclamaas") : t === "gratis" ? tr("adminTabFree") : tr("adminTabCats")}
            </button>
          ))}
        </div>

        {/* ── Tab: Proclamas ── */}
        {tab === "proclamas" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold text-white">
                {tr("adminProclamasTitle")} ({proclamas.length})
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-emerald-400 font-medium">{pub} {tr("adminPublished")}</span>
                <span className="text-orange-400 font-medium">{hid} {tr("adminHidden")}</span>
              </div>
            </div>

            <div className="space-y-2">
              {proclamas.map((p) => {
                const busy = actionLoading === p.id + "-d" || actionLoading === p.id + "-t";
                return (
                  <div
                    key={p.id}
                    className={`bg-[#111111] border rounded-xl px-5 py-4 ${p.publicada ? "border-[#1E1E1E]" : "border-orange-900/40 bg-orange-950/10"}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium leading-snug mb-2">
                          &ldquo;{p.texto}&rdquo;
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="text-[#A0A0A0]">— {p.autor}</span>
                          <span className="text-emerald-400 font-bold">${(p.monto / 100).toFixed(2)}</span>
                          <span className="text-[#A0A0A0]">
                            {new Date(p.created_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className={p.publicada ? "text-emerald-400 font-medium" : "text-orange-400 font-medium"}>
                            {p.publicada ? tr("adminStatusPub") : tr("adminStatusHid")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleToggle(p.id)}
                          disabled={busy}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 ${
                            p.publicada
                              ? "bg-orange-900/30 text-orange-400 hover:bg-orange-900/50"
                              : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                          }`}
                        >
                          {actionLoading === p.id + "-t" ? "…" : p.publicada ? tr("adminHideBtn") : tr("adminShowBtn")}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.texto)}
                          disabled={busy}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-40"
                        >
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

        {/* ── Tab: Nueva Gratis ── */}
        {tab === "gratis" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-white mb-1">{tr("adminFreeTitle")}</h2>
            <p className="text-[#A0A0A0] text-sm mb-6">{tr("adminFreeDesc")}</p>

            <form onSubmit={handleFree} className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">Texto *</label>
                <textarea
                  value={freeTexto}
                  onChange={(e) => setFreeTexto(e.target.value.slice(0, 280))}
                  rows={4}
                  required
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                />
                <p className="text-right text-xs text-[#A0A0A0] mt-1">{freeTexto.length}/280</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">Autor *</label>
                <input
                  type="text"
                  value={freeAutor}
                  onChange={(e) => setFreeAutor(e.target.value)}
                  required
                  maxLength={80}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">Categoría</label>
                <select
                  value={freeCategoria}
                  onChange={(e) => setFreeCategoria(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                >
                  {categorias.filter((c) => c.activa).map((c) => (
                    <option key={c.id} value={c.nombre_es}>
                      {c.emoji} {lang === "es" ? c.nombre_es : c.nombre_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                  {tr("adminFreeMontoLabel")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    type="number"
                    value={freeMonto}
                    onChange={(e) => setFreeMonto(e.target.value)}
                    min="0"
                    step="1"
                    className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              {freeMsg && (
                <p className={`text-sm text-center font-medium ${freeMsg === tr("adminFreeSuccess") ? "text-emerald-400" : "text-red-400"}`}>
                  {freeMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={freeLoading || !freeTexto.trim() || !freeAutor.trim()}
                className="w-full bg-[#3B82F6] text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40"
              >
                {freeLoading ? tr("adminFreeBtnLoading") : tr("adminFreeBtn")}
              </button>
            </form>
          </div>
        )}

        {/* ── Tab: Categorías ── */}
        {tab === "categorias" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-6">{tr("adminCatsTitle")}</h2>

            {/* List */}
            <div className="space-y-2 mb-8">
              {categorias.map((cat) => (
                <div key={cat.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl px-5 py-3 flex items-center gap-4">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{cat.nombre_es} / {cat.nombre_en}</p>
                    <span className={`text-xs font-semibold ${cat.activa ? "text-emerald-400" : "text-[#A0A0A0]"}`}>
                      {cat.activa ? tr("adminCatsActive") : tr("adminCatsInactive")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCatToggle(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        cat.activa
                          ? "bg-orange-900/30 text-orange-400 hover:bg-orange-900/50"
                          : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                      }`}
                    >
                      {cat.activa ? tr("adminCatsDeactivateBtn") : tr("adminCatsActivateBtn")}
                    </button>
                    <button
                      onClick={() => handleCatDelete(cat.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
                    >
                      {tr("adminCatsDeleteBtn")}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* New category form */}
            <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">{tr("adminCatsNewTitle")}</h3>
              <form onSubmit={handleCatCreate} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">{tr("adminCatsEmoji")}</label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    maxLength={4}
                    className="w-16 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-3 py-2 text-white text-center focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">{tr("adminCatsNombreEs")}</label>
                  <input
                    type="text"
                    value={newNombreEs}
                    onChange={(e) => setNewNombreEs(e.target.value)}
                    required
                    className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#3B82F6] w-36"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0A0] mb-1">{tr("adminCatsNombreEn")}</label>
                  <input
                    type="text"
                    value={newNombreEn}
                    onChange={(e) => setNewNombreEn(e.target.value)}
                    required
                    className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#3B82F6] w-36"
                  />
                </div>
                <button
                  type="submit"
                  disabled={catLoading || !newNombreEs || !newNombreEn}
                  className="bg-[#3B82F6] text-white font-semibold px-5 py-2 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40"
                >
                  {catLoading ? tr("adminCatsAddBtnLoading") : tr("adminCatsAddBtn")}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
