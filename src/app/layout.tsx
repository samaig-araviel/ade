import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme/ThemeScript";

export const metadata: Metadata = {
  title: "ADE - Araviel Decision Engine | Intelligent LLM Routing",
  description: "The intelligent LLM router that automatically selects the optimal AI model for every prompt. Smarter routing means better results, lower costs, and faster responses.",
  keywords: ["LLM", "AI", "routing", "GPT", "Claude", "Gemini", "Perplexity", "Grok", "Mistral", "machine learning", "artificial intelligence"],
  authors: [{ name: "Araviel" }],
  openGraph: {
    title: "ADE - Araviel Decision Engine",
    description: "Intelligent LLM routing for optimal AI model selection",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ADE - Araviel Decision Engine",
    description: "Intelligent LLM routing for optimal AI model selection",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased min-h-screen bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
