import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DNA Político — seu mapa de ideias",
  description: "Responda 30 perguntas e explore seu posicionamento em seis eixos políticos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
