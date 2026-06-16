import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning ERP",
  description: "A clean Next.js learning rebuild."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
