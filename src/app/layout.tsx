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
    <html lang="en" className="overflow-x-hidden bg-slate-950">
      <body className="overflow-x-hidden text-slate-100">{children}</body>
    </html>
  );
}
