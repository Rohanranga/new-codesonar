import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { SpotlightEffect } from "@/components/ui/SpotlightEffect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeSonar - AI Code Analysis",
  description: "Deep analysis of code repositories using Google Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Header />
        <SpotlightEffect />
        <main className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
          {children}
        </main>
      </body>
    </html>
  );
}
