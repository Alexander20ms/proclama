"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { t as tFn, type TKey } from "@/lib/i18n";

export type { TKey };
export type Theme = "dark" | "light";

type Ctx = {
  tr: (k: TKey) => string;
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
};

const LanguageContext = createContext<Ctx>({
  tr: (k) => k,
  theme: "dark",
  toggleTheme: () => {},
  mounted: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("proclama_theme") as Theme | null;
    const initialTheme = savedTheme ?? "dark";
    setThemeState(initialTheme);
    if (initialTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("proclama_theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  function tr(k: TKey): string {
    return tFn(k);
  }

  return (
    <LanguageContext.Provider value={{ tr, theme, toggleTheme, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
