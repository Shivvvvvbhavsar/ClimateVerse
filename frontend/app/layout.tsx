import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "ClimateVerse — Simulate Today. Protect Tomorrow.",
  description: "An Agentic AI-Powered Living Climate Digital Twin & Decision Intelligence Platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-base-950 text-ink-100 font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
