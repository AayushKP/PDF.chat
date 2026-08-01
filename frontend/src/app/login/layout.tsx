import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - PDF.chat",
  description: "Sign in to PDF.chat to start chatting with your PDF documents using AI.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
