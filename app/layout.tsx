import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Space+Grotesk:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
