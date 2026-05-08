import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Affordable plans for SEO agencies of all sizes. Start for free today.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
