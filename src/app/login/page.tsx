import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Nepal Law AI with Google to continue your legal research.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
