import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guia Espiritual",
  description: "Chatbot espiritual catolico con Next.js y OpenRouter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
