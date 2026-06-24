import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayFy",
  description: "Sistema para reservas de quadras",
  icons: {
    icon: "/favicon.png",
  },
};;

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
