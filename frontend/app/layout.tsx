import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayFy",
  description: "Sistema para reservas de quadras",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
};

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

