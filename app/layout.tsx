import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Proclama — Tu creencia vale más que un tweet",
  description:
    "Plataforma donde cualquier persona paga mínimo $1 para publicar una declaración pública permanente.",
  openGraph: {
    title: "Proclama",
    description: "Tu creencia vale más que un tweet",
    siteName: "Proclama",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('proclama_theme')??"dark";if(t==="light")document.documentElement.classList.remove("dark");else document.documentElement.classList.add("dark");}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
