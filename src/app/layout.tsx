import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediaLens",
  description:
    "Cross-source framing and bias discrepancy engine for Iran–US news coverage",
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
