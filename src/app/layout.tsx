import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TraumaNetProvider } from "@/lib/TraumaNetContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TraumaNet | Emergency Triage, Hospital Bed & Pre-Admission Logistics",
  description:
    "Eliminating the 3 fatal Golden Hour bottlenecks: medical uncertainty en-route via multimodal AI, ICU bed mismatch via 15-minute soft-locks, and billing counter delays.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900 min-h-screen selection:bg-red-600 selection:text-white antialiased`}>
        <TraumaNetProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">{children}</div>
          </div>
        </TraumaNetProvider>
      </body>
    </html>
  );
}
