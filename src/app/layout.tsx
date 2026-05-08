import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Report Manager",
  description: "Manage SEO clients, reports, notes and templates",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
