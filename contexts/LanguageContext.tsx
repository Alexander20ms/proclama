"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Lang = "es" | "en";

const T = {
  es: {
    // Modal
    langQuestion: "Elige tu idioma",
    // Header
    tagline: "Tu creencia vale más que un tweet",
    publishBtn: "Publicar mi proclama",
    langToggle: "EN",
    // Rankings
    rankingsTitle: "Rankings",
    rankTab1: "La más cara",
    rankTab2: "La más amada",
    rankTab3: "La más impactante",
    rankEmpty: "Sin datos aún",
    rankMonto: "Monto",
    rankReactions: "reacciones",
    // Muro
    muroCount: "proclamas publicadas",
    muroSorted: "Mayor monto primero",
    muroEmpty: "El muro está vacío",
    muroEmptyDesc: "¡Sé la primera persona en proclamar algo al mundo!",
    muroEmptyBtn: "Publicar mi proclama",
    // Back / Nav
    backToWall: "← Ver el muro",
    viewWall: "Ver el muro →",
    // Nueva
    nuevaTitle: "Nueva Proclama",
    nuevaDesc:
      "Escribe lo que quieres declarar al mundo. Paga mínimo $1 y quedará publicado para siempre.",
    nuevaTextoLabel: "Tu proclama",
    nuevaTextoPlaceholder: "Escribe tu declaración aquí...",
    nuevaAutorLabel: "Tu nombre o apodo",
    nuevaAutorPlaceholder: "Ej: María García, @usuario, Anónimo",
    nuevaCatLabel: "Categoría",
    nuevaMontoLabel: "Monto (USD)",
    nuevaMontoPays: "Pagarás",
    nuevaMontoUSD: "USD con tarjeta",
    nuevaBtn: "Proclamar y pagar",
    nuevaBtnLoading: "Preparando el pago...",
    nuevaSecure: "Pago seguro vía Stripe · Sin cuenta requerida",
    nuevaOtro: "Otro",
    nuevaMin: "Mínimo 1",
    nuevaErrorCampos: "Completa todos los campos",
    nuevaErrorMonto: "El monto mínimo es $1",
    nuevaErrorTexto: "Escribe tu proclama",
    nuevaErrorAutor: "Ingresa tu nombre o apodo",
    nuevaErrorConexion: "Error de conexión. Intenta nuevamente.",
    nuevaErrorGenerico: "Ocurrió un error. Intenta nuevamente.",
    // Exito
    exitoTitle: "¡Tu proclama fue publicada!",
    exitoDesc: "Ya está visible en el muro público para todo el mundo.",
    exitoShare: "Compartir en X",
    exitoTweetSuffix: "Lo proclamé públicamente en Proclama 📣",
    exitoTweetGeneric: "¡Acabo de publicar mi proclama en Proclama! 📣",
    // Admin login
    adminTitle: "Panel Admin",
    adminSubtitle: "Solo acceso autorizado",
    adminPasswordPlaceholder: "Contraseña",
    adminLoginBtn: "Entrar",
    adminLoginBtnLoading: "Verificando...",
    adminWrongPass: "Contraseña incorrecta",
    adminBackToWall: "← Volver al muro",
    // Admin tabs
    adminTabProclamaas: "Proclamas",
    adminTabFree: "Nueva Gratis",
    adminTabCats: "Categorías",
    // Admin proclamas
    adminProclamasTitle: "Todas las proclamas",
    adminPublished: "publicadas",
    adminHidden: "ocultas",
    adminStatusPub: "● Publicada",
    adminStatusHid: "○ Oculta",
    adminHideBtn: "Ocultar",
    adminShowBtn: "Mostrar",
    adminDeleteBtn: "Eliminar",
    adminDeleteConfirm: "¿Eliminar permanentemente esta proclama?",
    adminDeleteError: "Error al eliminar.",
    adminToggleError: "Error al cambiar estado.",
    // Admin free
    adminFreeTitle: "Nueva proclama gratuita",
    adminFreeDesc: "Se publica directamente sin pasar por Stripe",
    adminFreeMontoLabel: "Monto visible (decorativo, en $)",
    adminFreeBtn: "Publicar gratis",
    adminFreeBtnLoading: "Publicando...",
    adminFreeSuccess: "¡Proclama publicada!",
    adminFreeError: "Error al publicar.",
    // Admin categories
    adminCatsTitle: "Gestión de Categorías",
    adminCatsNombreEs: "Nombre ES",
    adminCatsNombreEn: "Nombre EN",
    adminCatsEmoji: "Emoji",
    adminCatsActive: "Activa",
    adminCatsInactive: "Inactiva",
    adminCatsActivateBtn: "Activar",
    adminCatsDeactivateBtn: "Desactivar",
    adminCatsDeleteBtn: "Eliminar",
    adminCatsAddBtn: "Agregar",
    adminCatsAddBtnLoading: "Agregando...",
    adminCatsNewTitle: "Nueva categoría",
    // Reactions
    reactAlready: "Ya reaccionaste con este emoji",
    // Footer
    footer: "Proclama — Cada palabra tiene un precio",
  },
  en: {
    // Modal
    langQuestion: "Choose your language",
    // Header
    tagline: "Your belief is worth more than a tweet",
    publishBtn: "Publish my proclamation",
    langToggle: "ES",
    // Rankings
    rankingsTitle: "Rankings",
    rankTab1: "Most expensive",
    rankTab2: "Most loved",
    rankTab3: "Most impactful",
    rankEmpty: "No data yet",
    rankMonto: "Amount",
    rankReactions: "reactions",
    // Muro
    muroCount: "published proclamations",
    muroSorted: "Highest amount first",
    muroEmpty: "The wall is empty",
    muroEmptyDesc: "Be the first person to proclaim something to the world!",
    muroEmptyBtn: "Publish my proclamation",
    // Back / Nav
    backToWall: "← View the wall",
    viewWall: "View the wall →",
    // Nueva
    nuevaTitle: "New Proclamation",
    nuevaDesc:
      "Write what you want to declare to the world. Pay minimum $1 and it will be published forever.",
    nuevaTextoLabel: "Your proclamation",
    nuevaTextoPlaceholder: "Write your declaration here...",
    nuevaAutorLabel: "Your name or alias",
    nuevaAutorPlaceholder: "E.g.: John Doe, @username, Anonymous",
    nuevaCatLabel: "Category",
    nuevaMontoLabel: "Amount (USD)",
    nuevaMontoPays: "You will pay",
    nuevaMontoUSD: "USD by card",
    nuevaBtn: "Proclaim and pay",
    nuevaBtnLoading: "Preparing payment...",
    nuevaSecure: "Secure payment via Stripe · No account required",
    nuevaOtro: "Other",
    nuevaMin: "Minimum 1",
    nuevaErrorCampos: "Fill in all fields",
    nuevaErrorMonto: "Minimum amount is $1",
    nuevaErrorTexto: "Write your proclamation",
    nuevaErrorAutor: "Enter your name or alias",
    nuevaErrorConexion: "Connection error. Try again.",
    nuevaErrorGenerico: "An error occurred. Try again.",
    // Exito
    exitoTitle: "Your proclamation was published!",
    exitoDesc: "It is now visible on the public wall for everyone.",
    exitoShare: "Share on X",
    exitoTweetSuffix: "I publicly proclaimed it on Proclama 📣",
    exitoTweetGeneric: "I just published my proclamation on Proclama! 📣",
    // Admin login
    adminTitle: "Admin Panel",
    adminSubtitle: "Authorized access only",
    adminPasswordPlaceholder: "Password",
    adminLoginBtn: "Enter",
    adminLoginBtnLoading: "Verifying...",
    adminWrongPass: "Incorrect password",
    adminBackToWall: "← Back to wall",
    // Admin tabs
    adminTabProclamaas: "Proclamations",
    adminTabFree: "New Free",
    adminTabCats: "Categories",
    // Admin proclamas
    adminProclamasTitle: "All proclamations",
    adminPublished: "published",
    adminHidden: "hidden",
    adminStatusPub: "● Published",
    adminStatusHid: "○ Hidden",
    adminHideBtn: "Hide",
    adminShowBtn: "Show",
    adminDeleteBtn: "Delete",
    adminDeleteConfirm: "Permanently delete this proclamation?",
    adminDeleteError: "Error deleting.",
    adminToggleError: "Error changing status.",
    // Admin free
    adminFreeTitle: "New free proclamation",
    adminFreeDesc: "Published directly without Stripe",
    adminFreeMontoLabel: "Visible amount (decorative, in $)",
    adminFreeBtn: "Publish for free",
    adminFreeBtnLoading: "Publishing...",
    adminFreeSuccess: "Proclamation published!",
    adminFreeError: "Error publishing.",
    // Admin categories
    adminCatsTitle: "Category Management",
    adminCatsNombreEs: "Name ES",
    adminCatsNombreEn: "Name EN",
    adminCatsEmoji: "Emoji",
    adminCatsActive: "Active",
    adminCatsInactive: "Inactive",
    adminCatsActivateBtn: "Activate",
    adminCatsDeactivateBtn: "Deactivate",
    adminCatsDeleteBtn: "Delete",
    adminCatsAddBtn: "Add",
    adminCatsAddBtnLoading: "Adding...",
    adminCatsNewTitle: "New category",
    // Reactions
    reactAlready: "You already reacted with this emoji",
    // Footer
    footer: "Proclama — Every word has a price",
  },
} as const;

export type TKey = keyof typeof T.es;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (k: TKey) => string;
  mounted: boolean;
};

const LanguageContext = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  tr: (k) => k,
  mounted: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("proclama_lang") as Lang | null;
    if (saved === "es" || saved === "en") {
      setLangState(saved);
    } else {
      setShowModal(true);
    }
    setMounted(true);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("proclama_lang", l);
    setShowModal(false);
  }

  function tr(k: TKey): string {
    return T[lang][k] as string;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr, mounted }}>
      {mounted && showModal && (
        <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center gap-8 px-4">
          <p className="text-5xl font-extrabold text-white tracking-tight">
            Proclama
          </p>
          <p className="text-[#A0A0A0] text-lg">
            Elige tu idioma · Choose your language
          </p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setLang("es")}
              className="bg-[#3B82F6] text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-500 transition-colors text-lg"
            >
              🇪🇸 Español
            </button>
            <button
              onClick={() => setLang("en")}
              className="bg-[#1E1E1E] border border-[#2A2A2A] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#2A2A2A] transition-colors text-lg"
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
