import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Proclama — Tu creencia vale más que un tweet",
  description:
    "Plataforma donde cualquier persona paga mínimo $1 para publicar una declaración pública que queda visible en un muro permanente.",
  openGraph: {
    title: "Proclama",
    description: "Tu creencia vale más que un tweet",
    siteName: "Proclama",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans bg-gray-50 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
