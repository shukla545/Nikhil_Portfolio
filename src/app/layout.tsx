import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nikhil Shukla | AI Full-Stack Portfolio",
  description:
    "AI-powered portfolio for Nikhil Shukla, an IT engineering student building MERN, RAG, LangChain, and agentic AI systems.",
  icons: {
    icon: "/nikhil-shukla.jpg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-ink font-sans text-white antialiased">{children}</body>
    </html>
  );
}
