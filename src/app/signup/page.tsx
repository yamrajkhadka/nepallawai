import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free Nepal Law AI account with Google and save every legal question you research.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return <AuthScreen mode="signup" />;
}
