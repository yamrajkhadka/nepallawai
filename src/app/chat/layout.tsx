import type { Metadata } from "next";
import { ChatApp } from "@/components/chat/shell";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default function ChatLayout({ children }: LayoutProps<"/chat">) {
  return <ChatApp>{children}</ChatApp>;
}
