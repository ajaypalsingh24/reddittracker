import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reddit Negative Thread Tracker",
  description: "Monitor negative Reddit mentions for brands using SerpApi, OpenAI, Neon, and email alerts.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
