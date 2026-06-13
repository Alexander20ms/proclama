"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { translations, t as tFn, type Lang, type TKey } from "@/lib/i18n";

export type { Lang, TKey };
export type Theme = "dark" | "light";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (k: TKey) => string;
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
};

const LanguageContext = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  tr: (k) => k,
  theme: "dark",
  toggleTheme: () => {},
  mounted: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("proclama_lang") as Lang | null;
    if (savedLang === "es" || savedLang === "en") setLangState(savedLang);
    else setShowModal(true);

    const savedTheme = localStorage.getItem("proclama_theme") as Theme | null;
    const initialTheme = savedTheme ?? "dark";
    setThemeState(initialTheme);
    if (initialTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    setMounted(true);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("proclama_lang", l);
    setShowModal(false);
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("proclama_theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  function tr(k: TKey): string {
    return tFn(lang, k);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr, theme, toggleTheme, mounted }}>
      {mounted && showModal && (
        <div className="fixed inset-0 bg-bg z-50 flex flex-col items-center justify-center gap-8 px-4">
          <p className="text-5xl font-extrabold text-foreground tracking-tight">
            Proclama<span className="text-accent">.</span>
          </p>
          <p className="text-muted text-lg">
            {translations.es.langQuestion} · {translations.en.langQuestion}
          </p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setLang("es")}
              className="bg-accent text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-500 transition-colors text-lg"
            >
              🇪🇸 Español
            </button>
            <button
              onClick={() => setLang("en")}
              className="bg-surface border border-line text-foreground font-bold px-8 py-4 rounded-xl hover:bg-hover transition-colors text-lg"
            >
              🇺🇸 English
            </button>
          </div>
        </div>
      )}
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
