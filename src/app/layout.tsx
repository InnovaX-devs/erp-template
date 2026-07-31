import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Esencia · Panel administrativo",
  description: "Panel de administración para el emprendimiento de perfumes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "!bg-ink !text-ivory !border !border-white/10 !rounded-lg !shadow-lg",
              title: "!text-sm !font-medium",
              error: "!border-clay/40",
              success: "!border-sage/40",
            },
          }}
        />
      </body>
    </html>
  );
}