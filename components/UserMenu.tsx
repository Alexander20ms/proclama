"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-line animate-pulse shrink-0" />;
  }

  if (!user || !profile) {
    return (
      <Link
        href="/login"
        className="text-xs font-semibold border border-line px-3 py-1.5 rounded-lg text-foreground hover:bg-hover transition-colors shrink-0"
      >
        Login
      </Link>
    );
  }

  const initial = profile.username[0]?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-opacity hover:opacity-80"
        style={{ backgroundColor: profile.color }}
        title={profile.username}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-surface border border-line rounded-xl shadow-xl py-1 w-44 z-50">
          <div className="px-4 py-2 border-b border-line">
            <p className="text-foreground text-xs font-bold truncate">@{profile.username}</p>
            <p className="text-muted text-xs truncate">{user.email}</p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-hover transition-colors"
          >
            <span>👤</span> Mi perfil
          </Link>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-hover transition-colors"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
