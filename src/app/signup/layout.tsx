import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Create your SEO Report Pad account and start automating your agency reporting in minutes.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
