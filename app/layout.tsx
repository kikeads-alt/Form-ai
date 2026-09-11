import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Poppins } from "next/font/google";

import { Logo } from "@/components/ui/Logo";

import "./globals.css";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Onboarding · kikeads_",
  description:
    "Cuestionario previo a las sesiones de capacitación 1:1 con Luis Enrique Barrantes.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col bg-crema font-sans text-negro">
        <header className="sobre-negro bg-negro">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Logo sobre="negro" />
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-mostaza">
              Onboarding
            </p>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="sobre-negro mt-16 bg-negro">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-xs uppercase tracking-[0.14em] text-crema/70">
              Luis Enrique Barrantes
            </p>
            <p className="font-sans text-xs text-crema/50">
              Tus respuestas solo las leo yo.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
