"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import UserMenu from "./UserMenu";

const HOME_URL = "https://proclama.vercel.app";

const FRASES = [
  "Your words outlive you.",
  "Silence is cheap. Proclamations are forever.",
  "What do you believe in enough to pay for?",
  "The world is listening.",
  "One dollar. One truth. Forever.",
  "Opinions fade. Proclamations don't.",
  "Be remembered for what you truly believe.",
  "Your truth deserves a permanent home.",
  "Say it loud. Say it forever.",
  "Not a tweet. A proclamation.",
  "What would you pay to be heard?",
  "Every belief has a price. What's yours?",
  "The wall never forgets.",
  "Make your mark on the world.",
  "Words are power. Proclamations are legacy.",
  "Dare to declare.",
  "Your conviction, immortalized.",
  "What you believe matters. Prove it.",
  "The boldest voices pay to be heard.",
  "Truth costs something. That's what makes it true.",
  "Don't just think it. Proclaim it.",
  "Leave something real behind.",
  "A proclamation is a promise to the world.",
  "Value your opinions. Literally.",
  "The loudest belief wins.",
  "Stand for something. Pay for it.",
  "Your voice. Your price. Your legacy.",
  "What's worth a dollar to you?",
  "Beliefs without cost are just thoughts.",
  "Make today's truth permanent."
];

export default function LeftSidebar() {
  const { tr, toggleTheme, theme } = useLanguage();
  const { user } = useAuth();
  const [nebulosas, setNebulosas] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setNebulosas(null); return; }
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/billetera", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setNebulosas(Number(d.nebulosas));
      }
    })();
  }, [user]);

  function handlePublish() {
    window.location.href = user ? "/nueva" : "/login?next=/nueva";
  }

  const fraseDelDia = FRASES[new Date().getDate() % FRASES.length];

  return (
    <div className="flex flex-col gap-2 py-4">
      {/* Logo + UserMenu */}
      <div className="px-3 mb-1 flex items-start justify-between gap-2">
        <div>
          <a
            href={HOME_URL}
            className="text-2xl font-extrabold text-foreground tracking-tight hover:opacity-75 transition-opacity"
          >
            Proclama<span className="text-accent">.</span>
          </a>
          <p className="text-muted text-xs mt-0.5">{tr("tagline")}</p>
        </div>
        <div className="pt-0.5">
          <UserMenu />
        </div>
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        className="mx-3 bg-accent text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-colors text-sm text-center"
      >
        {tr("publishBtn")}
      </button>

      {/* Home button */}
      <button
        onClick={() => { window.location.href = HOME_URL; }}
        className="mx-3 bg-accent text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-colors text-sm text-center"
      >
        Home
      </button>

      {/* Wallet link — only when logged in */}
      {user && nebulosas !== null && (
        <Link
          href="/billetera"
          className="mx-3 flex items-center justify-center gap-1.5 bg-[#1F2937] border border-[#374151] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#374151] transition-colors"
        >
          ♦️ {nebulosas.toLocaleString()}
        </Link>
      )}

      {/* Theme toggle */}
      <div className="mt-4 mx-3 border-t border-line pt-4">
        <button
          onClick={toggleTheme}
          className={`w-full text-xs font-bold py-1.5 rounded-lg transition-colors border ${
            theme === "dark"
              ? "bg-white text-black border-white hover:bg-gray-100"
              : "bg-black text-white border-black hover:bg-gray-900"
          }`}
        >
          {theme === "dark" ? "Dark" : "Light"}
        </button>
        <p className="text-center text-xs italic mt-3 px-1 leading-snug" style={{ color: "#6B7280" }}>
          {fraseDelDia}
        </p>
      </div>
    </div>
  );
}
