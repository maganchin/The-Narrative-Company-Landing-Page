import type { Metadata } from "next";
import "./globals.css";
import { Gaegu, Noto_Sans_Display, Space_Grotesk } from "next/font/google";

const fontDisplay = Gaegu({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const fontTagline = Noto_Sans_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-tagline",
});

const fontBody = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "The Narrative Company",
  description:
    "A new personalized game lab that brings the nostalgia back to casual games.",
  openGraph: {
    title: "The Narrative Company",
    description: "A new personalized game lab that brings the nostalgia back to casual games.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontTagline.variable} ${fontBody.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
