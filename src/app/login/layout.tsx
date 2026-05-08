import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your SEO Report Pad account to manage your clients and reports.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
