"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Lang = "es" | "en";
export type Theme = "dark" | "light";

const T = {
  es: {
    langQuestion: "Elige tu idioma",
    tagline: "Tu creencia vale más que un tweet",
    publishBtn: "Publicar mi proclama",
    langToggle: "EN",
    themeToggleDark: "☀️",
    themeToggleLight: "🌙",
    rankingsTitle: "Rankings",
    rankTab1: "La más cara",
    rankTab2: "La más amada",
    rankTab3: "La más impactante",
    rankEmpty: "Sin datos aún",
    rankMonto: "Monto",
    rankReactions: "reacciones",
    muroCount: "proclamas publicadas",
    muroSorted: "Mayor monto primero",
    muroEmpty: "El muro está vacío",
    muroEmptyDesc: "¡Sé la primera persona en proclamar algo al mundo!",
    muroEmptyBtn: "Publicar mi proclama",
    searchPlaceholder: "Buscar por texto o autor...",
    filterAll: "Todas las categorías",
    sortLabel: "Ordenar",
    sortMonto: "Mayor monto",
    sortFecha: "Más reciente",
    sortReacciones: "Más reacciones",
    backToWall: "← Ver el muro",
    viewWall: "Ver el muro →",
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
    exitoTitle: "¡Tu proclama fue publicada!",
    exitoDesc: "Ya está visible en el muro público para todo el mundo.",
    exitoShare: "Compartir en X",
    exitoTweetSuffix: "Lo proclamé públicamente en Proclama 📣",
    exitoTweetGeneric: "¡Acabo de publicar mi proclama en Proclama! 📣",
    shareWhatsapp: "Compartir en WhatsApp",
    adminTitle: "Panel Admin",
    adminSubtitle: "Solo acceso autorizado",
    adminPasswordPlaceholder: "Contraseña",
    adminLoginBtn: "Entrar",
    adminLoginBtnLoading: "Verificando...",
    adminWrongPass: "Contraseña incorrecta",
    adminBackToWall: "← Volver al muro",
    adminTabProclamaas: "Proclamas",
    adminTabFree: "Nueva Gratis",
    adminTabCats: "Categorías",
    adminTabStats: "Estadísticas",
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
    adminFreeTitle: "Nueva proclama gratuita",
    adminFreeDesc: "Se publica directamente sin pasar por Stripe",
    adminFreeMontoLabel: "Monto visible (decorativo, en $)",
    adminFreeBtn: "Publicar gratis",
    adminFreeBtnLoading: "Publicando...",
    adminFreeSuccess: "¡Proclama publicada!",
    adminFreeError: "Error al publicar.",
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
    statsTitle: "Estadísticas",
    statsTotalIngresos: "Ingresos totales",
    statsPublicadas: "Proclamas publicadas",
    statsTotalReacciones: "Total reacciones",
    statsCatPopular: "Categoría más popular",
    statsMasCara: "Proclama más cara",
    statsPromedio: "Monto promedio",
    reactAlready: "Ya reaccionaste con este emoji",
    creyentesCount: "creyentes",
    creyentesTotal: "total",
    apoyoBtn: "+ Unirme desde $1",
    apoyoTitle: "Únete a esta proclama",
    apoyoDesc: "Tu apoyo queda registrado para siempre",
    apoyoBtn2: "Apoyar con",
    apoyoBtnLoading: "Redirigiendo...",
    apoyoSuccess: "¡Gracias por tu apoyo!",
    footer: "Proclama — Cada palabra tiene un precio",
    verProclama: "Ver proclama completa →",
    proclamaNotFound: "Proclama no encontrada",
    proclamaNotFoundDesc: "Esta proclama no existe o no está publicada.",
  },
  en: {
    langQuestion: "Choose your language",
    tagline: "Your belief is worth more than a tweet",
    publishBtn: "Publish my proclamation",
    langToggle: "ES",
    themeToggleDark: "☀️",
    themeToggleLight: "🌙",
    rankingsTitle: "Rankings",
    rankTab1: "Most expensive",
    rankTab2: "Most loved",
    rankTab3: "Most impactful",
    rankEmpty: "No data yet",
    rankMonto: "Amount",
    rankReactions: "reactions",
    muroCount: "published proclamations",
    muroSorted: "Highest amount first",
    muroEmpty: "The wall is empty",
    muroEmptyDesc: "Be the first person to proclaim something to the world!",
    muroEmptyBtn: "Publish my proclamation",
    searchPlaceholder: "Search by text or author...",
    filterAll: "All categories",
    sortLabel: "Sort",
    sortMonto: "Highest amount",
    sortFecha: "Most recent",
    sortReacciones: "Most reactions",
    backToWall: "← View the wall",
    viewWall: "View the wall →",
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
    exitoTitle: "Your proclamation was published!",
    exitoDesc: "It is now visible on the public wall for everyone.",
    exitoShare: "Share on X",
    exitoTweetSuffix: "I publicly proclaimed it on Proclama 📣",
    exitoTweetGeneric: "I just published my proclamation on Proclama! 📣",
    shareWhatsapp: "Share on WhatsApp",
    adminTitle: "Admin Panel",
    adminSubtitle: "Authorized access only",
    adminPasswordPlaceholder: "Password",
    adminLoginBtn: "Enter",
    adminLoginBtnLoading: "Verifying...",
    adminWrongPass: "Incorrect password",
    adminBackToWall: "← Back to wall",
    adminTabProclamaas: "Proclamations",
    adminTabFree: "New Free",
    adminTabCats: "Categories",
    adminTabStats: "Statistics",
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
    adminFreeTitle: "New free proclamation",
    adminFreeDesc: "Published directly without Stripe",
    adminFreeMontoLabel: "Visible amount (decorative, in $)",
    adminFreeBtn: "Publish for free",
    adminFreeBtnLoading: "Publishing...",
    adminFreeSuccess: "Proclamation published!",
    adminFreeError: "Error publishing.",
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
    statsTitle: "Statistics",
    statsTotalIngresos: "Total revenue",
    statsPublicadas: "Published proclamations",
    statsTotalReacciones: "Total reactions",
    statsCatPopular: "Most popular category",
    statsMasCara: "Most expensive",
    statsPromedio: "Average amount",
    reactAlready: "You already reacted with this emoji",
    creyentesCount: "believers",
    creyentesTotal: "total",
    apoyoBtn: "+ Join from $1",
    apoyoTitle: "Join this proclamation",
    apoyoDesc: "Your support is permanently recorded",
    apoyoBtn2: "Support with",
    apoyoBtnLoading: "Redirecting...",
    apoyoSuccess: "Thank you for your support!",
    footer: "Proclama — Every word has a price",
    verProclama: "View full proclamation →",
    proclamaNotFound: "Proclamation not found",
    proclamaNotFoundDesc: "This proclamation does not exist or is not published.",
  },
} as const;

export type TKey = keyof typeof T.es;

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
    // Language
    const savedLang = localStorage.getItem("proclama_lang") as Lang | null;
    if (savedLang === "es" || savedLang === "en") setLangState(savedLang);
    else setShowModal(true);

    // Theme
    const savedTheme = localStorage.getItem("proclama_theme") as Theme | null;
    const initialTheme = savedTheme ?? "dark";
    setThemeState(initialTheme);
    // Apply (script in layout already did this, but sync state)
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
    return T[lang][k] as string;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr, theme, toggleTheme, mounted }}>
      {/* Language selection modal */}
      {mounted && showModal && (
        <div className="fixed inset-0 bg-bg z-50 flex flex-col items-center justify-center gap-8 px-4">
          <p className="text-5xl font-extrabold text-foreground tracking-tight">
            Proclama<span className="text-accent">.</span>
          </p>
          <p className="text-muted text-lg">
            Elige tu idioma · Choose your language
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
