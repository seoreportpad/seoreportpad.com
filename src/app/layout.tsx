import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SEO Report Pad - Automated SEO Reporting for Agencies",
    template: "%s | SEO Report Pad"
  },
  description: "Manage SEO clients, reports, notes and templates with our professional SEO agency software.",
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
