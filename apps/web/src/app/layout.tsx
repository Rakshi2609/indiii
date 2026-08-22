import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LAND AI | इंडी-भूमि - Verified Land Record Intelligence",
  description: "Enterprise Indian Land Revenue, Indic Document AI & Cadastral GIS Verification Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        <AuthProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 max-w-full">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
