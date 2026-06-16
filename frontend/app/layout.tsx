import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IQuadra",
  description: "Sistema para reservas de quadras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
