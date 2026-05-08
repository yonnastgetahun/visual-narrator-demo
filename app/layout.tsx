import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Narrator Benchmark — Real-time AI video description speed test",
  description: "Visual Narrator Benchmark — Real-time AI video description speed test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
