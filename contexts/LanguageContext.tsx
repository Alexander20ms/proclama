"use client";

import { createContext, useContext, type ReactNode } from "react";
import { t as tFn, type TKey } from "@/lib/i18n";

export type { TKey };

type Ctx = {
  tr: (k: TKey) => string;
};

const LanguageContext = createContext<Ctx>({ tr: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  function tr(k: TKey): string {
    return tFn(k);
  }

  return (
    <LanguageContext.Provider value={{ tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
