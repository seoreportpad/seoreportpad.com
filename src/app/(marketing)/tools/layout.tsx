import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SEO Tools",
  description: "A suite of free SEO tools for agencies and consultants to audit and optimize websites efficiently.",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
